import { createClient as createSupabaseDirect } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import axios from 'axios';

// This prevents Next.js from trying to "pre-render" this route during build
export const dynamic = 'force-dynamic';

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

    // 2. Handle Text Messages & Advanced Commands
    const text = body.message?.text;
    if (text) {
      const args = text.split(' ');
      const command = args[0].toLowerCase();
      const param = args[1]; // e.g. the Order ID

      // COMMAND: /stats - Operations Overview
      if (command === '/stats') {
        const { data: orders } = await supabase.from('sample_orders').select('status');
        const stats = orders?.reduce((acc: any, curr: any) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        }, {});

        const message = 
          `📊 *Operations Summary*\n\n` +
          `📝 Drafts: *${stats?.draft || 0}*\n` +
          `📨 Submitted: *${stats?.submitted || 0}*\n` +
          `🔬 Sampling: *${stats?.sampling_in_progress || 0}*\n` +
          `📦 Ready: *${stats?.ready || 0}*\n` +
          `🚚 Dispatched: *${stats?.dispatched || 0}*`;

        await sendTelegram(userId, message);
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /list - Client-wise Order List
      if (command === '/list') {
        const { data: orders } = await supabase
          .from('sample_orders')
          .select('order_id, status, client:clients(name)')
          .not('status', 'eq', 'dispatched');

        if (!orders?.length) {
          await sendTelegram(userId, "✅ *No active orders found.*");
          return NextResponse.json({ ok: true });
        }

        // Group by Client
        const grouped: Record<string, any[]> = {};
        orders.forEach((o: any) => {
          const name = Array.isArray(o.client) ? o.client[0]?.name : o.client?.name;
          if (!grouped[name]) grouped[name] = [];
          grouped[name].push(o);
        });

        let message = `📋 *Active Order Directory*\n\n`;
        for (const [client, clientOrders] of Object.entries(grouped)) {
          message += `👤 *${client}* (${clientOrders.length})\n`;
          clientOrders.forEach(o => {
            message += `└ \`/view ${o.order_id}\` — _${o.status.replace('_', ' ')}_\n`;
          });
          message += `\n`;
        }

        await sendTelegram(userId, message);
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /view [ID] - Technical Breakdown
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
        
        let message = `📦 *Order Detail: ${order.order_id}*\n`;
        message += `👤 Client: *${clientName}*\n`;
        message += `🏁 Status: *${order.status.toUpperCase()}*\n`;
        message += `📅 Target: ${new Date(order.delivery_date).toLocaleDateString()}\n\n`;
        
        message += `👕 *Styles (${order.styles?.length || 0}):*\n`;
        order.styles?.forEach((s: any) => {
          message += `• ${s.item_number}: ${s.style_name} (${s.quantity}pcs)\n`;
        });

        message += `\n*Quick Actions:*\n`;
        message += `/status_${order.order_id}_sampling\n`;
        message += `/status_${order.order_id}_ready\n`;
        message += `\n*Logistics:* \`/ship ${order.order_id} [Courier] [Tracking] [Date]\``;

        await sendTelegram(userId, message);
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /status_[ID]_[STAGE] - Quick Status Move
      if (command.startsWith('/status_')) {
        const parts = command.split('_');
        const orderId = parts[1].toUpperCase();
        const newStatus = parts.slice(2).join('_');

        const { error } = await supabase
          .from('sample_orders')
          .update({ status: newStatus })
          .eq('order_id', orderId);

        await sendTelegram(userId, error ? `❌ Update failed` : `✅ *${orderId}* moved to *${newStatus}*`);
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /ship [ID] [Courier] [Tracking] [Date?]
      if (command === '/ship') {
        const orderId = args[1]?.toUpperCase();
        const courier = args[2];
        const tracking = args[3];
        const date = args[4] || new Date().toISOString().split('T')[0];

        if (!orderId || !courier || !tracking) {
          await sendTelegram(userId, "⚠️ *Format:* \`/ship [ID] [Courier] [Tracking] [YYYY-MM-DD]\`\n_Date is optional._");
          return NextResponse.json({ ok: true });
        }

        const { error } = await supabase
          .from('sample_orders')
          .update({ 
            status: 'dispatched',
            courier_name: courier,
            tracking_number: tracking,
            dispatched_at: date
          })
          .eq('order_id', orderId);

        await sendTelegram(userId, error ? `❌ Logistics update failed` : `🚚 *${orderId}* marked as DISPATCHED\n📦 ${courier}: \`${tracking}\``);
        return NextResponse.json({ ok: true });
      }

      // Default Help
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: userId,
        text: "👋 *A2Z Operations Bot*\n\n`/list` - View client-wise orders\n`/stats` - Overview\n`/view [ID]` - Details & Actions",
        parse_mode: 'Markdown'
      });
      return NextResponse.json({ ok: true });
    }

    // --- Add this helper function at the bottom of the file (before the last }) ---
    async function sendTelegram(chatId: string, text: string) {
       await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown'
       });
    }
  

      // COMMAND: /delayed - Identify Bottlenecks
      if (text === '/delayed') {
        const { data: orders } = await supabase
          .from('sample_orders')
          .select('order_id, delivery_date, client:clients(name)')
          .not('status', 'in', '("dispatched", "ready")');

        const now = new Date();
        // Cast as any to bypass the array vs object type mismatch for the join
        const delayed = (orders as any[])?.filter(o => o.delivery_date && new Date(o.delivery_date) < now) || [];

        let message = `⚠️ *DELAYED ORDERS (${delayed.length})*\n\n`;
        if (delayed.length === 0) {
          message = "✅ *All orders are currently on track!*";
        } else {
          delayed.forEach(o => {
            // Check if client is returned as an array (Supabase standard) or single object
            const clientName = Array.isArray(o.client) 
              ? o.client[0]?.name 
              : o.client?.name;

            message += `• \`${o.order_id}\` | ${clientName || 'Unknown'}\n   📅 Target: ${new Date(o.delivery_date).toLocaleDateString()}\n\n`;
          });
        }

        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          chat_id: userId,
          text: message,
          parse_mode: 'Markdown'
        });
        return NextResponse.json({ ok: true });
      }
      // PRESERVE: Handle "Hi" or any other non-command text
      if (!isCommand) {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          chat_id: userId,
          text: "👋 *Hello Admin!*\n\nI am ready for instructions. You can use the menu for /stats or send me an Excel template to create a new order.",
          parse_mode: 'Markdown'
        });
      }
      return NextResponse.json({ ok: true });
    }

    // 3. Handle Documents (Excel)
    const document = body.message?.document;
    if (!document) return NextResponse.json({ ok: true });

    // 4. Get File from Telegram
    const fileRes = await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${document.file_id}`);
    const filePath = fileRes.data.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;

    // 5. Parse Excel
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const workbook = XLSX.read(response.data, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) throw new Error("Excel sheet is empty.");

    const firstRow = rows[0];
    const clientEmail = firstRow.client_email?.trim().toLowerCase();
    const clientName = firstRow.client_name || 'New Client';
    
    if (!clientEmail) throw new Error("Column 'client_email' is missing.");

    // 6. Find or Create Client
    let { data: client } = await supabase.from('clients').select('id').eq('email', clientEmail).single();
    if (!client) {
        const { data: newClient, error: cErr } = await supabase
            .from('clients')
            .insert([{ name: clientName, email: clientEmail }])
            .select().single();
        if (cErr) throw cErr;
        client = newClient;
    }

    // 7. Create Order
    const deliveryDate = firstRow.delivery_date ? new Date(firstRow.delivery_date) : new Date(Date.now() + 21 * 86400000);
    const { data: order, error: orderErr } = await supabase
      .from('sample_orders')
      .insert([{
        client_id: client?.id,
        order_id: `TG-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'submitted',
        delivery_date: deliveryDate.toISOString(),
        created_by: 'automation',
        order_source: 'email',
        priority: firstRow.priority?.toLowerCase() || 'medium'
      }])
      .select().single();

    if (orderErr) throw orderErr;

    // 8. Add Styles
    const nameParts = clientName.split(' ');
    const initials = nameParts.length > 1 
      ? (nameParts[0].substring(0, 2) + nameParts[1].substring(0, 2)).toUpperCase()
      : clientName.substring(0, 4).toUpperCase();

    const stylesToInsert = rows.map((row, index) => ({
      order_id: order.id,
      item_number: row.item_number || `${initials}-${1000 + index + 1}`,
      style_name: row.style_name || 'General Clothing',
      fabric: row.fabric || 'TBD',
      color_name: row.color || 'TBD',
      quantity: Number(row.quantity) || 1,
      print_type: 'solid_dyed'
    }));

    await supabase.from('order_styles').insert(stylesToInsert);

    // 9. Success Reply
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: userId,
        text: `✅ Order Created: ${order.order_id}\nStyles: ${stylesToInsert.length}`
    });

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: true }); 
  }
}