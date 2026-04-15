'use server'

import { createClient } from '@/utils/supabase/server'
import { v4 as uuidv4 } from 'uuid'

interface CandidateMapping {
  candidate_id: string // UUID
  ranking_cid: string // Original ID from rankings
  job_id: string
  name: string
  email: string
}

export async function createCandidateMappings(params: {
  job_id: string
  session_id: string
  candidates: Array<{ cid: string; name: string; email: string }>
}) {
  try {
    const supabase = await createClient()

    const { job_id, candidates } = params

    if (!job_id || candidates.length === 0) {
      throw new Error('Job ID and candidates are required')
    }

    // Generate UUIDs and create mapping records
    const mappings: CandidateMapping[] = candidates.map(candidate => ({
      candidate_id: uuidv4(), // Generate new UUID for this candidate
      ranking_cid: candidate.cid, // Store original ranking ID
      job_id,
      name: candidate.name || `Candidate ${candidate.cid.substring(0, 8)}`,
      email: candidate.email || 'unknown@example.com',
    }))

    // Insert mappings into database
    const { data, error } = await supabase
      .from('candidate_mappings')
      .upsert(mappings, {
        onConflict: 'job_id,ranking_cid', // Update if already exists
      })
      .select('*')

    if (error) {
      console.error('Error creating candidate mappings:', error)
      throw new Error(`Failed to create candidate mappings: ${error.message}`)
    }

    return {
      success: true,
      mappings: data || mappings,
      message: `Created UUIDs for ${mappings.length} candidates`,
    }
  } catch (err) {
    console.error('Error in createCandidateMappings:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create candidate mappings',
      mappings: [],
    }
  }
}

export async function getCandidateMappings(jobId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('candidate_mappings')
      .select('*')
      .eq('job_id', jobId)

    if (error) {
      throw new Error(`Failed to fetch candidate mappings: ${error.message}`)
    }

    return {
      success: true,
      mappings: data || [],
    }
  } catch (err) {
    console.error('Error in getCandidateMappings:', err)
    return {
      success: false,
      mappings: [],
      error: err instanceof Error ? err.message : 'Failed to fetch candidate mappings',
    }
  }
}

export async function getCandidateByUUID(candidateUUID: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('candidate_mappings')
      .select('*')
      .eq('candidate_id', candidateUUID)
      .single()

    if (error) {
      throw new Error(`Candidate not found: ${error.message}`)
    }

    return {
      success: true,
      candidate: data,
    }
  } catch (err) {
    console.error('Error in getCandidateByUUID:', err)
    return {
      success: false,
      candidate: null,
      error: err instanceof Error ? err.message : 'Failed to fetch candidate',
    }
  }
}
