'use server'

import { createClient } from '@/utils/supabase/server'

interface CreateAssignmentsParams {
  job_id: string
  session_id: string
  candidate_ids: string[]
}

export async function bulkCreateAssignments(params: CreateAssignmentsParams) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { job_id, session_id, candidate_ids } = params

    if (!job_id || candidate_ids.length === 0) {
      throw new Error('Job ID and candidate IDs are required')
    }

    // Fetch the assignment template for this job
    const { data: assignmentTemplate, error: fetchError } = await supabase
      .from('assignments')
      .select('assignment_json, assignment_pdf_url')
      .eq('job_id', job_id)
      .eq('candidate_id', '00000000-0000-0000-0000-000000000000')
      .single()

    if (fetchError || !assignmentTemplate) {
      throw new Error('Assignment template not found for this job. Please create an assignment first.')
    }

    // Create assignment records for each candidate
    const assignmentRecords = candidate_ids.map(candidate_id => ({
      job_id,
      candidate_id,
      assignment_json: assignmentTemplate.assignment_json,
      assignment_pdf_url: assignmentTemplate.assignment_pdf_url,
      submission_file_url: null,
      evaluation_report: null,
      evaluation_pdf_url: null
    }))

    // Batch insert the records
    const { data, error: insertError } = await supabase
      .from('assignments')
      .upsert(assignmentRecords, { onConflict: 'job_id,candidate_id' })
      .select('job_id, candidate_id')

    if (insertError) {
      console.error('Assignment creation error:', insertError)
      throw new Error(`Failed to create assignments: ${insertError.message}`)
    }

    return {
      success: true,
      created_count: data?.length || 0,
      message: `Successfully created ${data?.length || 0} assignments`
    }
  } catch (err) {
    console.error('Error in bulkCreateAssignments:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create assignments',
    }
  }
}
