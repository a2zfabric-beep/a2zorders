import { createClient as createSupabaseDirect } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// --- HELPER: Send Telegram Message (Using HTML mode for stability) ---
async function sendTelegram(chatId: string, text: string, replyMarkup?: any) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML', // HTML is more stable than Markdown for IDs like TG-4380
      reply_markup: replyMarkup
    });
  } catch (err: any) {
    console.error('Telegram Send Error:', err.response?.data || err.message);
  }
}

async function answerCallback(callbackQueryId: string, text: string) {
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
    callback_query_id: callbackQueryId,
    text: text
  });
}

export async function POST(request: Request) {
  try {
    const ALLOWED_USER_ID = process.env.TELEGRAM_ALLOWED_USER_ID;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createSupabaseDirect(supabaseUrl, supabaseKey);

    const body = await request.json();

    // --- 1. CALLBACK QUERY HANDLER (FOR MEDIA TAGGING) ---
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const adminId = callbackQuery.from.id.toString();
      if (adminId !== ALLOWED_USER_ID) return NextResponse.json({ ok: true });

      const data = callbackQuery.data; 
      if (data.startsWith('attach_')) {
        const orderIdString = data.replace('attach_', '');
        const originalMediaMsg = callbackQuery.message.reply_to_message;

        if (!originalMediaMsg) {
          await answerCallback(callbackQuery.id, "❌ Original media not found.");
          return NextResponse.json({ ok: true });
        }

        let fileId = '';
        let fileType = 'image';
        if (originalMediaMsg.photo) {
          fileId = originalMediaMsg.photo[originalMediaMsg.photo.length - 1].file_id;
          fileType = 'image';
        } else if (originalMediaMsg.video) {
          fileId = originalMediaMsg.video.file_id;
          fileType = 'video';
        } else if (originalMediaMsg.document) {
          fileId = originalMediaMsg.document.file_id;
          fileType = 'document';
        }

        const { error } = await supabase.from('order_media').insert([{
          order_id: orderIdString,
          telegram_message_id: originalMediaMsg.message_id.toString(),
          chat_id: originalMediaMsg.chat.id.toString(),
          file_id: fileId,
          file_type: fileType,
          created_at: new Date(originalMediaMsg.date * 1000).toISOString()
        }]);

        if (error) {
          await answerCallback(callbackQuery.id, "❌ Database error.");
        } else {
          await answerCallback(callbackQuery.id, "✅ Media Attached!");
          await sendTelegram(adminId, `✅ Media attached to Order <b>${orderIdString}</b>`);
          await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/deleteMessage`, {
            chat_id: adminId, message_id: callbackQuery.message.message_id
          });
        }
      }
      return NextResponse.json({ ok: true });
    }

    // --- 2. MESSAGE HANDLER ---
    const message = body.message;
    const userId = message?.from?.id?.toString();
    if (userId !== ALLOWED_USER_ID) return NextResponse.json({ ok: true });

    const text = message?.text;
    const document = message?.document;

    if (text) {
      const args = text.split(' ');
      const command = args[0].toLowerCase();
      const param = args[1];

      // COMMAND: /tag (Reply to media)
      if (command === '/tag') {
        const replyTo = message.reply_to_message;
        if (!replyTo || (!replyTo.photo && !replyTo.video && !replyTo.document)) {
          await sendTelegram(userId, "⚠️ <b>Reply to a photo/video</b> with /tag to attach it.");
          return NextResponse.json({ ok: true });
        }
        const { data: orders } = await supabase.from('sample_orders').select('order_id').not('status', 'eq', 'dispatched').limit(10);
        if (!orders?.length) {
          await sendTelegram(userId, "⚠️ No active orders found.");
          return NextResponse.json({ ok: true });
        }
        const keyboard = { inline_keyboard: orders.map(o => ([{ text: `Order ${o.order_id}`, callback_data: `attach_${o.order_id}` }])) };
        await sendTelegram(userId, "📎 <b>Select Order to attach to:</b>", keyboard);
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /stats
      if (command === '/stats') {
        const { data: orders } = await supabase.from('sample_orders').select('status');
        const stats = orders?.reduce((acc: any, curr: any) => { acc[curr.status] = (acc[curr.status] || 0) + 1; return acc; }, {});
        const msg = `📊 <b>Operations Summary</b>\n\n` +
          `📝 Drafts: <b>${stats?.draft || 0}</b>\n` +
          `📨 Submitted: <b>${stats?.submitted || 0}</b>\n` +
          `🔬 Sampling: <b>${stats?.sampling_in_progress || 0}</b>\n` +
          `📦 Ready: <b>${stats?.ready || 0}</b>\n` +
          `🚚 Dispatched: <b>${stats?.dispatched || 0}</b>`;
        await sendTelegram(userId, msg);
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /list (Simplified to avoid join errors)
      if (command === '/list') {
        const { data: orders, error } = await supabase.from('sample_orders').select('order_id, status').not('status', 'eq', 'dispatched');
        if (error || !orders?.length) {
          await sendTelegram(userId, "📋 <b>No active orders found.</b>");
          return NextResponse.json({ ok: true });
        }
        let msg = `📋 <b>Active Orders</b>\n\n`;
        orders.forEach(o => {
          msg += `• <code>/view ${o.order_id}</code> — <i>${o.status}</i>\n`;
        });
        await sendTelegram(userId, msg);
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /view [ID]
      if (command === '/view' && param) {
        const { data: order } = await supabase.from('sample_orders').select('*').eq('order_id', param.toUpperCase()).single();
        if (!order) {
          await sendTelegram(userId, `❌ Order <b>${param}</b> not found.`);
          return NextResponse.json({ ok: true });
        }

        // Separate query for styles using the internal integer ID
        const { data: styles } = await supabase.from('order_styles').select('*').eq('order_id', order.id);

        let msg = `📦 <b>Order: ${order.order_id}</b>\n` +
          `🏁 Status: <b>${order.status.toUpperCase()}</b>\n` +
          `📅 Target: ${order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'}\n\n` +
          `👕 <b>Styles:</b>\n`;
        
        styles?.forEach((s: any) => {
          msg += `• ${s.item_number}: ${s.style_name} (${s.quantity}pcs)\n`;
        });

        msg += `\n<b>Actions:</b>\n/status_${order.order_id}_sampling\n/status_${order.order_id}_ready\n\n/ship ${order.order_id} [Courier] [Tracking]`;
        await sendTelegram(userId, msg);
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /status_[ID]_[STAGE]
      if (command.startsWith('/status_')) {
        const parts = command.split('_');
        const orderIdString = parts[1].toUpperCase();
        const newStatus = parts.slice(2).join('_');
        const { error } = await supabase.from('sample_orders').update({ status: newStatus }).eq('order_id', orderIdString);
        await sendTelegram(userId, error ? `❌ Update failed` : `✅ <b>${orderIdString}</b> is now <b>${newStatus}</b>`);
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /ship [ID] [Courier] [Tracking]
      if (command === '/ship') {
        const oId = args[1]?.toUpperCase();
        const courier = args[2];
        const tracking = args[3];
        if (!oId || !courier || !tracking) {
          await sendTelegram(userId, "⚠️ Use: <code>/ship [ID] [Courier] [Tracking]</code>");
          return NextResponse.json({ ok: true });
        }
        await supabase.from('sample_orders').update({ status: 'dispatched', courier_name: courier, tracking_number: tracking, dispatched_at: new Date().toISOString() }).eq('order_id', oId);
        await sendTelegram(userId, `🚚 <b>${oId}</b> Dispatched via ${courier}`);
        return NextResponse.json({ ok: true });
      }

      if (command === '/start' || command === 'hi') {
        await sendTelegram(userId, "👋 <b>A2Z Ops Bot</b>\n\n/list - View orders\n/stats - Summary\n/tag - (Reply to photo) Tag media");
      }
      return NextResponse.json({ ok: true });
    }

    // --- 3. EXCEL UPLOAD ---
    if (document) {
      const fileRes = await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${document.file_id}`);
      const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${fileRes.data.result.file_path}`;
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const workbook = XLSX.read(response.data, { type: 'buffer' });
      const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

      const firstRow = rows[0];
      const clientEmail = firstRow.client_email?.trim().toLowerCase();
      if (!clientEmail) return NextResponse.json({ ok: true });

      let { data: client } = await supabase.from('clients').select('id').eq('email', clientEmail).single();
      if (!client) {
        const { data: nc } = await supabase.from('clients').insert([{ name: firstRow.client_name || 'New Client', email: clientEmail }]).select().single();
        client = nc;
      }

      const { data: order } = await supabase.from('sample_orders').insert([{
        client_id: client?.id,
        order_id: `TG-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'submitted',
        delivery_date: new Date(Date.now() + 21 * 86400000).toISOString(),
        created_by: 'automation',
        order_source: 'email'
      }]).select().single();

      const stylesToInsert = rows.map((r, i) => ({
        order_id: order.id,
        item_number: r.item_number || `STYLE-${1000 + i}`,
        style_name: r.style_name || 'Item',
        quantity: Number(r.quantity) || 1
      }));

      await supabase.from('order_styles').insert(stylesToInsert);
      await sendTelegram(userId, `✅ <b>Order Created: ${order.order_id}</b>`);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Bot Error:', err);
    return NextResponse.json({ ok: true });
  }
}