'use server'

import { AuthService } from './services/auth.service'
import { JobService } from './services/job.service'
import type { CreateJobParams, ActionResult } from './types'

export async function createSigHireJob(params: CreateJobParams): Promise<ActionResult<{ job_id: string; jd_pdf_url: string; message: string }>> {
  try {
    const { data: { user }, error: userError } = await AuthService.getCurrentUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    let jdPdfUrl = ''

    if (params.jd_file) {
      const { data: uploadUrl, error: uploadError } = await JobService.uploadJD(user.id, params.jd_file)

      if (uploadError) {
        throw new Error(`Failed to upload JD PDF: ${uploadError.message}`)
      }

      jdPdfUrl = uploadUrl || ''
    }

    const { data, error } = await JobService.create({
      Job_Name: params.job_name,
      Job_Description: params.job_description,
      JD_pdf: jdPdfUrl,
      form_link: params.form_link,
      form_id: params.form_id,
      employer_id: user.id,
      status: 'sighyre',
    })

    if (error) {
      console.error('Job creation error:', error)
      throw new Error(`Failed to create job: ${error.message}`)
    }

    return {
      success: true,
      data: {
        job_id: data.job_id,
        jd_pdf_url: jdPdfUrl,
        message: 'Job created successfully',
      },
    }
  } catch (err) {
    console.error('Error in createSigHireJob:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create job',
    }
  }
}
