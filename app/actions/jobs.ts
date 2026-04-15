'use server'

import { createClient } from '@/utils/supabase/server'

interface CreateJobParams {
  job_name: string
  job_description: string
  jd_file?: File
  form_link?: string
  form_id?: string
}

export async function createSigHireJob(params: CreateJobParams) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    let jdPdfUrl = ''

    // Upload JD PDF to Supabase storage if file is provided
    if (params.jd_file) {
      try {
        // Convert File to Buffer for server-side processing
        const arrayBuffer = await params.jd_file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Create a unique filename
        const timestamp = Date.now()
        const fileName = `${user.id}/${timestamp}-${params.jd_file.name}`
        
        // Upload to 'jd' bucket
        const { error: uploadError } = await supabase.storage
          .from('jd')
          .upload(fileName, buffer, {
            contentType: params.jd_file.type,
            upsert: false,
          })

        if (uploadError) {
          console.error('File upload error:', uploadError)
          throw new Error(`Failed to upload JD PDF: ${uploadError.message}`)
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('jd')
          .getPublicUrl(fileName)

        jdPdfUrl = publicUrlData.publicUrl
      } catch (fileErr) {
        console.error('Error processing JD file:', fileErr)
        throw fileErr
      }
    }

    // Insert job record with status 'sighyre'
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        'Job_Name': params.job_name,
        'Job_Description': params.job_description,
        'JD_pdf': jdPdfUrl || '',
        form_link: params.form_link,
        form_id: params.form_id,
        employer_id: user.id,
        status: 'sighyre',
      })
      .select('job_id')
      .single()

    if (error) {
      console.error('Job creation error:', error)
      throw new Error(`Failed to create job: ${error.message}`)
    }

    return {
      success: true,
      job_id: data.job_id,
      jd_pdf_url: jdPdfUrl,
      message: 'Job created successfully'
    }
  } catch (err) {
    console.error('Error in createSigHireJob:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create job',
    }
  }
}
