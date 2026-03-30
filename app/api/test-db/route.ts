import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        message: 'Supabase configuration missing',
        instructions: 'Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file',
        example: {
          NEXT_PUBLIC_SUPABASE_URL: 'https://your-project.supabase.co',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your-anon-key-here',
        },
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Test Supabase connection by querying the sample_orders table
    const { data, error, count } = await supabaseAdmin
      .from('sample_orders')
      .select('*', { count: 'exact', head: true })
      .limit(1);
    
    if (error) {
      // If table doesn't exist yet, that's okay - connection works
      if (error.message.includes('relation "sample_orders" does not exist')) {
        return NextResponse.json({
          success: true,
          message: 'Supabase connection successful',
          note: 'Database connection works, but sample_orders table does not exist yet',
          instructions: 'Run the SQL schema from db/schema.sql in your Supabase project',
          configuration: {
            url: supabaseUrl ? '✓ Configured' : '✗ Missing',
            key: supabaseKey ? '✓ Configured' : '✗ Missing',
            serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Configured' : '✗ Missing',
          },
          timestamp: new Date().toISOString(),
        });
      }
      
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      data: {
        tableExists: true,
        rowCount: count || 0,
        sampleData: data || [],
      },
      configuration: {
        url: supabaseUrl ? '✓ Configured' : '✗ Missing',
        key: supabaseKey ? '✓ Configured' : '✗ Missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Configured' : '✗ Missing',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Supabase connection test failed',
      error: error.message || 'Unknown error',
      troubleshooting: [
        '1. Check if Supabase project is active',
        '2. Verify environment variables in .env.local',
        '3. Ensure database is created in Supabase',
        '4. Check network connectivity',
      ],
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}