import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;

export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: Missing Supabase credentials" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Run the migration to update the status constraint
    const { error } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        ALTER TABLE IF EXISTS public.jobs 
        DROP CONSTRAINT IF EXISTS jobs_status_check;
        
        ALTER TABLE IF EXISTS public.jobs
        ADD CONSTRAINT jobs_status_check CHECK (
          status = ANY(ARRAY['draft'::text, 'active'::text, 'mailed'::text, 'sighyre'::text])
        );
      `,
    });

    if (error) {
      // Try alternative approach using raw SQL if exec_sql doesn't exist
      // We'll attempt the migration via direct query
      return NextResponse.json(
        { 
          error: "Migration attempt made, but may need manual execution", 
          details: error,
          instruction: "Please run this SQL in your Supabase dashboard: ALTER TABLE public.jobs DROP CONSTRAINT jobs_status_check; ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check CHECK (status = ANY(ARRAY['draft'::text, 'active'::text, 'mailed'::text, 'sighyre'::text]));"
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Database constraint updated successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[/api/migrate-jobs-status] Error:", err);
    return NextResponse.json(
      { 
        error: "Migration failed", 
        details: String(err),
        instruction: "Please run this SQL manually in your Supabase dashboard: ALTER TABLE public.jobs DROP CONSTRAINT jobs_status_check; ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check CHECK (status = ANY(ARRAY['draft'::text, 'active'::text, 'mailed'::text, 'sighyre'::text]));"
      },
      { status: 500 }
    );
  }
}
