import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check if we're in development mode and show helpful message
if (process.env.NODE_ENV === 'development') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '⚠️  Supabase environment variables are missing or empty.\n' +
      'Please add the following to your .env.local file:\n' +
      'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n' +
      'SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n\n' +
      'Get these from your Supabase project dashboard.'
    );
  }
}

// Client for client-side usage (with limited permissions)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

// Admin client for server-side usage (with full permissions)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

// Helper function for server-side database queries
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }

  try {
    // For Supabase, we need to use their RPC or query methods
    // This is a simplified version - in production you'd use proper Supabase methods
    const { data, error } = await supabaseAdmin.from('_dummy').select('*').limit(1);
    
    if (error) {
      console.error('Database query error:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }

    // For now, return empty array since we're just testing connection
    return [] as T[];
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Helper function for single row queries
export async function querySingle<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results[0] || null;
}

// Helper function for executing commands (INSERT, UPDATE, DELETE)
export async function execute(sql: string, params?: any[]): Promise<{ rowCount: number }> {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }

  try {
    // Simplified execution for testing
    console.log('Executing SQL:', sql);
    return { rowCount: 0 };
  } catch (error) {
    console.error('Database execute error:', error);
    throw new Error(`Database execute failed: ${error.message}`);
  }
}