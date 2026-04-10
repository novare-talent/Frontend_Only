import { createClient } from '@/utils/supabase/server'
import type { CandidateMapping } from '../types'

export class CandidateService {
  static async createMappings(mappings: CandidateMapping[]) {
    const supabase = await createClient()
    
    return await supabase
      .from('candidate_mappings')
      .upsert(mappings, { onConflict: 'job_id,ranking_cid' })
      .select('*')
  }

  static async getMappingsByJobId(jobId: string) {
    const supabase = await createClient()
    
    return await supabase
      .from('candidate_mappings')
      .select('*')
      .eq('job_id', jobId)
  }

  static async getMappingByUUID(candidateUUID: string) {
    const supabase = await createClient()
    
    return await supabase
      .from('candidate_mappings')
      .select('*')
      .eq('candidate_id', candidateUUID)
      .single()
  }
}
