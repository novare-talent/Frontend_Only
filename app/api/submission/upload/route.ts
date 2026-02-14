import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';

// Note: This runs on the server side, so we need to use server-side Supabase client
// For now, we'll use the edge runtime approach

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const jobId = formData.get('job_id') as string;
    const candidateId = formData.get('candidate_id') as string;

    // Validate inputs
    if (!file || !jobId || !candidateId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, job_id, or candidate_id' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.zip') && !fileName.endsWith('.py')) {
      return NextResponse.json(
        { error: 'Only .zip and .py files are allowed' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get the SUPABASE_URL and SUPABASE_KEY from environment
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error('Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500, headers: corsHeaders }
      );
    }

    try {
      // Import supabase client dynamically (server-side)
      const { createClient: createServerClient } = await import('@supabase/supabase-js');
      const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY);

      // Generate unique storage path
      const fileExtension = fileName.endsWith('.zip') ? '.zip' : '.py';
      const timestamp = Date.now();
      const storagePath = `${jobId}/${candidateId}/${timestamp}${fileExtension}`;
      const bucketName = 'assignments';

      // Convert file to buffer
      const buffer = await file.arrayBuffer();

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, buffer, {
          contentType: file.type || 'application/octet-stream',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json(
          { error: `Failed to upload file: ${uploadError.message}` },
          { status: 500, headers: corsHeaders }
        );
      }

      // Construct public URL
      const submissionUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${storagePath}`;

      // Update the assignments table with the submission URL
      const { error: updateError } = await supabase
        .from('assignments')
        .update({
          submission_file_url: submissionUrl,
        })
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId);

      if (updateError) {
        console.error('Update error:', updateError);
        // File was uploaded but DB update failed - this is not ideal
        return NextResponse.json(
          { 
            error: `File uploaded but failed to register: ${updateError.message}`,
            submission_url: submissionUrl // Return URL even on partial failure
          },
          { status: 500, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Assignment submitted successfully',
          submission_url: submissionUrl,
          job_id: jobId,
          candidate_id: candidateId,
        },
        { status: 200, headers: corsHeaders }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to process submission' },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
