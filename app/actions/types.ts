// Shared types for server actions
export interface ActionResult<T = void> {
  success: boolean
  error?: string
  data?: T
}

export interface CandidateMapping {
  candidate_id: string
  ranking_cid: string
  job_id: string
  name: string
  email: string
}

export interface CreateAssignmentsParams {
  job_id: string
  session_id: string
  candidate_ids: string[]
}

export interface CreateJobParams {
  job_name: string
  job_description: string
  jd_file?: File
  form_link?: string
  form_id?: string
}
