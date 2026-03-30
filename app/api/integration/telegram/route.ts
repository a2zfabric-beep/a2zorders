import { createClient as createSupabaseDirect } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import axios from 'axios';

export const dynamic = 'force-dynamic';

// --- HELPER: Send Telegram Message ---
async function sendTelegram(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown'
  });
}

export async function POST(request: Request) {
  try {
    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const ALLOWED_USER_ID = process.env.TELEGRAM_ALLOWED_USER_ID;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createSupabaseDirect(supabaseUrl, supabaseKey);

    const body = await request.json();

    // 1. Security Check
    const userId = body.message?.from?.id?.toString();
    if (userId !== ALLOWED_USER_ID) {
      return NextResponse.json({ ok: true });
    }

    const text = body.message?.text;
    const document = body.message?.document;

    // 2. HANDLE TEXT COMMANDS
    if (text) {
      const args = text.split(' ');
      const command = args[0].toLowerCase();
      const param = args[1];

      // COMMAND: /stats
      if (command === '/stats') {
        const { data: orders } = await supabase.from('sample_orders').select('status');
        const stats = orders?.reduce((acc: any, curr: any) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        }, {});

        const msg = `📊 *Operations Summary*\n\n` +
          `📝 Drafts: *${stats?.draft || 0}*\n` +
          `📨 Submitted: *${stats?.submitted || 0}*\n` +
          `🔬 Sampling: *${stats?.sampling_in_progress || 0}*\n` +
          `📦 Ready: *${stats?.ready || 0}*\n` +
          `🚚 Dispatched: *${stats?.dispatched || 0}*`;
        await sendTelegram(userId, msg);
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /list
      if (command === '/list') {
        const { data: orders } = await supabase
          .from('sample_orders')
          .select('order_id, status, client:clients(name)')
          .not('status', 'eq', 'dispatched');

        if (!orders?.length) {
          await sendTelegram(userId, "✅ *No active orders found.*");
          return NextResponse.json({ ok: true });
        }

        const grouped: Record<string, any[]> = {};
        orders.forEach((o: any) => {
          const name = Array.isArray(o.client) ? o.client[0]?.name : o.client?.name;
          const clientName = name || 'Unknown Client';
          if (!grouped[clientName]) grouped[clientName] = [];
          grouped[clientName].push(o);
        });

        let msg = `📋 *Active Order Directory*\n\n`;
        for (const [client, clientOrders] of Object.entries(grouped)) {
          msg += `👤 *${client}* (${clientOrders.length})\n`;
          clientOrders.forEach(o => {
            msg += `└ \`/view ${o.order_id}\` — _${o.status.replace('_', ' ')}_\n`;
          });
          msg += `\n`;
        }
        await sendTelegram(userId, msg);
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /view [ID]
      if (command === '/view' && param) {
        const { data: order } = await supabase
          .from('sample_orders')
          .select('*, client:clients(name), styles:order_styles(*)')
          .eq('order_id', param.toUpperCase())
          .single();

        if (!order) {
          await sendTelegram(userId, `❌ Order \`${param}\` not found.`);
          return NextResponse.json({ ok: true });
        }

        const clientName = Array.isArray(order.client) ? order.client[0]?.name : order.client?.name;
        let msg = `📦 *Order Detail: ${order.order_id}*\n` +
          `👤 Client: *${clientName}*\n` +
          `🏁 Status: *${order.status.toUpperCase()}*\n` +
          `📅 Target: ${new Date(order.delivery_date).toLocaleDateString()}\n\n` +
          `👕 *Styles (${order.styles?.length || 0}):*\n`;
        
        order.styles?.forEach((s: any) => {
          msg += `• ${s.item_number}: ${s.style_name} (${s.quantity}pcs)\n`;
        });

        msg += `\n*Quick Actions:*\n` +
          `/status_${order.order_id}_sampling\n` +
          `/status_${order.order_id}_ready\n\n` +
          `*Logistics:* \`/ship ${order.order_id} [Courier] [Tracking] [Date]\``;

        await sendTelegram(userId, msg);
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /delayed
      if (command === '/delayed') {
        const { data: orders } = await supabase
          .from('sample_orders')
          .select('order_id, delivery_date, client:clients(name)')
          .not('status', 'in', '("dispatched", "ready")');

        const now = new Date();
        const delayed = (orders as any[])?.filter(o => o.delivery_date && new Date(o.delivery_date) < now) || [];

        let msg = `⚠️ *DELAYED ORDERS (${delayed.length})*\n\n`;
        if (delayed.length === 0) {
          msg = "✅ *All orders are currently on track!*";
        } else {
          delayed.forEach(o => {
            const clientName = Array.isArray(o.client) ? o.client[0]?.name : o.client?.name;
            msg += `• \`${o.order_id}\` | ${clientName || 'Unknown'}\n   📅 Target: ${new Date(o.delivery_date).toLocaleDateString()}\n\n`;
          });
        }
        await sendTelegram(userId, msg);
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /status_[ID]_[STAGE]
      if (command.startsWith('/status_')) {
        const parts = command.split('_');
        const orderId = parts[1].toUpperCase();
        const newStatus = parts.slice(2).join('_');

        const { error } = await supabase.from('sample_orders').update({ status: newStatus }).eq('order_id', orderId);
        await sendTelegram(userId, error ? `❌ Update failed` : `✅ *${orderId}* moved to *${newStatus}*`);
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /ship [ID] [Courier] [Tracking] [Date?]
      if (command === '/ship') {
        const oId = args[1]?.toUpperCase();
        const courier = args[2];
        const tracking = args[3];
        const date = args[4] || new Date().toISOString().split('T')[0];

        if (!oId || !courier || !tracking) {
          await sendTelegram(userId, "⚠️ *Format:* \`/ship [ID] [Courier] [Tracking] [YYYY-MM-DD]\`\n_Date is optional._");
          return NextResponse.json({ ok: true });
        }

        const { error } = await supabase.from('sample_orders').update({ 
          status: 'dispatched', courier_name: courier, tracking_number: tracking, dispatched_at: date 
        }).eq('order_id', oId);

        await sendTelegram(userId, error ? `❌ Logistics update failed` : `🚚 *${oId}* marked as DISPATCHED\n📦 ${courier}: \`${tracking}\``);
        return NextResponse.json({ ok: true });
      }

      // Handle "Hi" or unknown text
      if (command === 'hi' || command === '/start') {
        await sendTelegram(userId, "👋 *A2Z Operations Bot*\n\n`/list` - View orders by client\n`/stats` - Overall summary\n`/delayed` - Bottleneck check\n\n_Or send an Excel file to create a new order._");
      }
      return NextResponse.json({ ok: true });
    }

    // 3. HANDLE DOCUMENTS (Excel Upload)
    if (document) {
      const fileRes = await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${document.file_id}`);
      const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${fileRes.data.result.file_path}`;
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const workbook = XLSX.read(response.data, { type: 'buffer' });
      const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

      if (rows.length === 0) throw new Error("Excel sheet is empty.");

      const firstRow = rows[0];
      const clientEmail = firstRow.client_email?.trim().toLowerCase();
      if (!clientEmail) throw new Error("Column 'client_email' is missing.");

      // Find or Create Client
      let { data: client } = await supabase.from('clients').select('id').eq('email', clientEmail).single();
      if (!client) {
        const { data: nc, error: cErr } = await supabase.from('clients').insert([{ name: firstRow.client_name || 'New Client', email: clientEmail }]).select().single();
        if (cErr) throw cErr;
        client = nc;
      }

      // Create Order (21 day lead time)
      const dDate = firstRow.delivery_date ? new Date(firstRow.delivery_date) : new Date(Date.now() + 21 * 86400000);
      const { data: order, error: oErr } = await supabase.from('sample_orders').insert([{
        client_id: client?.id,
        order_id: `TG-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'submitted',
        delivery_date: dDate.toISOString(),
        created_by: 'automation',
        order_source: 'email',
        priority: firstRow.priority?.toLowerCase() || 'medium'
      }]).select().single();
      if (oErr) throw oErr;

      // Map Multiple Styles with initials
      const initials = (firstRow.client_name || 'CL').substring(0, 4).toUpperCase();
      const stylesToInsert = rows.map((r, i) => ({
        order_id: order.id,
        item_number: r.item_number || `${initials}-${1000 + i + 1}`,
        style_name: r.style_name || 'General Clothing',
        fabric: r.fabric || 'TBD',
        color_name: r.color || 'TBD',
        quantity: Number(r.quantity) || 1,
        print_type: 'solid_dyed'
      }));

      await supabase.from('order_styles').insert(stylesToInsert);
      await sendTelegram(userId, `✅ *Order Created: ${order.order_id}*\nStyles Added: ${stylesToInsert.length}\nClient: ${firstRow.client_name}`);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Bot Error:', err);
    return NextResponse.json({ ok: true });
  }
}