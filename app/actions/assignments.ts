'use server'

import { AuthService } from './services/auth.service'
import type { CreateAssignmentsParams, ActionResult } from './types'
import { AssignmentService } from './services/assignment.service'

export async function bulkCreateAssignments(params: CreateAssignmentsParams): Promise<ActionResult<{ created_count: number; message: string }>> {
  try {
    const { data: { user }, error: userError } = await AuthService.getCurrentUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { job_id, candidate_ids } = params

    if (!job_id || candidate_ids.length === 0) {
      throw new Error('Job ID and candidate IDs are required')
    }

    const { data: assignmentTemplate, error: fetchError } = await AssignmentService.getTemplate(job_id)

    if (fetchError || !assignmentTemplate) {
      throw new Error('Assignment template not found for this job. Please create an assignment first.')
    }

    const assignmentRecords = candidate_ids.map(candidate_id => ({
      job_id,
      candidate_id,
      assignment_json: assignmentTemplate.assignment_json,
      assignment_pdf_url: assignmentTemplate.assignment_pdf_url,
      submission_file_url: null,
      evaluation_report: null,
      evaluation_pdf_url: null
    }))

    const { data, error: insertError } = await AssignmentService.bulkCreate(assignmentRecords)

    if (insertError) {
      console.error('Assignment creation error:', insertError)
      throw new Error(`Failed to create assignments: ${insertError.message}`)
    }

    return {
      success: true,
      data: {
        created_count: data?.length || 0,
        message: `Successfully created ${data?.length || 0} assignments`,
      },
    }
  } catch (err) {
    console.error('Error in bulkCreateAssignments:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create assignments',
    }
  }
}
