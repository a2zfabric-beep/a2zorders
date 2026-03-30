import { NextResponse } from 'next/server';
import { createClient as createSupabaseDirect } from '@supabase/supabase-js';

// Initialize Supabase Direct to ensure environment variables are read correctly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    const supabase = createSupabaseDirect(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "Client ID is required" }, { status: 400 });
    }

    const supabase = createSupabaseDirect(supabaseUrl, supabaseKey);

    // 1. CHECK FOR ACTIVE ORDERS FIRST
    const { data: activeOrders, error: checkError } = await supabase
      .from('sample_orders')
      .select('id')
      .eq('client_id', id)
      .limit(1);

    if (checkError) throw checkError;

    if (activeOrders && activeOrders.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: "RESTRICTED: This client has active orders. You must delete the orders before deleting the client." 
      }, { status: 400 });
    }

    // 2. IF NO ORDERS, PROCEED TO DELETE
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete Client Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Add POST/PATCH here if they exist in your file...