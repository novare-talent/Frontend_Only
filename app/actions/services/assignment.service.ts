import { createClient } from '@/utils/supabase/server'

export class AssignmentService {
  static async getTemplate(jobId: string) {
    const supabase = await createClient()
    
    return await supabase
      .from('assignments')
      .select('assignment_json, assignment_pdf_url')
      .eq('job_id', jobId)
      .eq('candidate_id', '00000000-0000-0000-0000-000000000000')
      .single()
  }

  static async bulkCreate(records: any[]) {
    const supabase = await createClient()
    
    return await supabase
      .from('assignments')
      .upsert(records, { onConflict: 'job_id,candidate_id' })
      .select('job_id, candidate_id')
  }
}
