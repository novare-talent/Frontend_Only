'use server'

import { v4 as uuidv4 } from 'uuid'
import { CandidateService } from './services/candidate.service'
import type { CandidateMapping, ActionResult } from './types'

export async function createCandidateMappings(params: {
  job_id: string
  session_id: string
  candidates: Array<{ cid: string; name: string; email: string }>
}): Promise<ActionResult<{ mappings: CandidateMapping[]; message: string }>> {
  try {
    const { job_id, candidates } = params

    if (!job_id || candidates.length === 0) {
      throw new Error('Job ID and candidates are required')
    }

    const mappings: CandidateMapping[] = candidates.map(candidate => ({
      candidate_id: uuidv4(),
      ranking_cid: candidate.cid,
      job_id,
      name: candidate.name || `Candidate ${candidate.cid.substring(0, 8)}`,
      email: candidate.email || 'unknown@example.com',
    }))

    const { data, error } = await CandidateService.createMappings(mappings)

    if (error) {
      throw new Error(`Failed to create candidate mappings: ${error.message}`)
    }

    return {
      success: true,
      data: {
        mappings: data || mappings,
        message: `Created UUIDs for ${mappings.length} candidates`,
      },
    }
  } catch (err) {
    console.error('Error in createCandidateMappings:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create candidate mappings',
    }
  }
}

export async function getCandidateMappings(jobId: string): Promise<ActionResult<CandidateMapping[]>> {
  try {
    const { data, error } = await CandidateService.getMappingsByJobId(jobId)

    if (error) {
      throw new Error(`Failed to fetch candidate mappings: ${error.message}`)
    }

    return {
      success: true,
      data: data || [],
    }
  } catch (err) {
    console.error('Error in getCandidateMappings:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch candidate mappings',
    }
  }
}

export async function getCandidateByUUID(candidateUUID: string): Promise<ActionResult<CandidateMapping>> {
  try {
    const { data, error } = await CandidateService.getMappingByUUID(candidateUUID)

    if (error) {
      throw new Error(`Candidate not found: ${error.message}`)
    }

    return {
      success: true,
      data,
    }
  } catch (err) {
    console.error('Error in getCandidateByUUID:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch candidate',
    }
  }
}
