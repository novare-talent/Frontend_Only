import { createClient } from '@/utils/supabase/server'

export class JobService {
  static async create(jobData: {
    Job_Name: string
    Job_Description: string
    JD_pdf: string
    form_link?: string
    form_id?: string
    employer_id: string
    status: string
  }) {
    const supabase = await createClient()
    
    return await supabase
      .from('jobs')
      .insert(jobData)
      .select('job_id')
      .single()
  }

  static async uploadJD(userId: string, file: File) {
    const supabase = await createClient()
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const timestamp = Date.now()
    const fileName = `${userId}/${timestamp}-${file.name}`
    
    const { error } = await supabase.storage
      .from('jd')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) return { data: null, error }

    const { data: publicUrlData } = supabase.storage
      .from('jd')
      .getPublicUrl(fileName)

    return { data: publicUrlData.publicUrl, error: null }
  }
}
