/**
 * Supabase Rankings Utility
 * Fetches rankings and query data directly from Supabase
 * This is the source of truth for ranking data
 */

import { createClient } from '@/utils/supabase/client';
import { Candidate, RankingsResponse } from './ranking-api';

/**
 * Parse rankings from Supabase sessions table
 * Handles three scenarios:
 * 1. Initial state: rankings column is empty [] -> use candidate_meta
 * 2. After queries: rankings column is array of query results -> use last (most recent) query
 */
function parseSupabaseRankings(data: any): Candidate[] {
  const candidates: Candidate[] = [];
  
  if (!data) return candidates;
  
  // Get rankings data - could be array or object with candidates property
  let rankingsData = data.rankings;
  
  // If rankings is a JSON string, parse it
  if (typeof rankingsData === 'string') {
    try {
      rankingsData = JSON.parse(rankingsData);
    } catch (e) {
      console.error('Failed to parse rankings JSON:', e);
      rankingsData = null;
    }
  }
  
  // SCENARIO 1: rankings column is empty [] -> use candidate_meta as initial rankings
  if (!rankingsData || (Array.isArray(rankingsData) && rankingsData.length === 0)) {
    console.log('📋 Rankings empty, using initial candidate metadata...');
    
    let metaData = data.candidate_meta;
    
    // Parse candidate_meta if it's a string
    if (typeof metaData === 'string') {
      try {
        metaData = JSON.parse(metaData);
      } catch (e) {
        console.error('Failed to parse candidate_meta:', e);
        return candidates;
      }
    }
    
    // candidate_meta is object with cid keys: {"0": {...}, "1": {...}, ...}
    if (metaData && typeof metaData === 'object' && !Array.isArray(metaData)) {
      Object.entries(metaData).forEach(([cid, candidateInfo]: [string, any]) => {
        candidates.push({
          cid: String(cid),
          name: candidateInfo.name || `Candidate ${cid}`,
          email: candidateInfo.email || null,
          jd_score: Number(candidateInfo.jd_score ?? 0),
          jd_reason: candidateInfo.jd_reason || 'Initial evaluation based on job description',
          total_score: Number(candidateInfo.jd_score ?? 0), // Initially same as jd_score
          query_score: undefined, // No query executed yet
        });
      });
      console.log(`✅ Loaded ${candidates.length} candidates from metadata`);
    }
    return candidates;
  }
  
  // SCENARIO 2 & 3: rankings column has data -> get LAST (most recent) query results
  if (Array.isArray(rankingsData)) {
    console.log(`📊 Rankings array has ${rankingsData.length} entries, fetching latest...`);
    
    // Get the last entry in rankings array (most recent query)
    const lastQueryResult = rankingsData[rankingsData.length - 1];
    
    // If last item has results, use those
    if (lastQueryResult && lastQueryResult.results && Array.isArray(lastQueryResult.results)) {
      lastQueryResult.results.forEach((candidate: any) => {
        candidates.push({
          cid: String(candidate.cid ?? 0),
          name: candidate.name || `Candidate ${candidate.cid}`,
          email: candidate.email || null,
          jd_score: Number(candidate.jd_score ?? 0),
          jd_reason: candidate.evaluation || candidate.evaluation_reason || candidate.jd_reason || 'Match based on job description',
          total_score: Number(candidate.total_score ?? candidate.query_score ?? candidate.jd_score ?? 0),
          query_score: candidate.query_score ? Number(candidate.query_score) : undefined,
          evaluation_reason: candidate.evaluation || candidate.evaluation_reason || candidate.jd_reason,
        });
      });
      console.log(`✅ Loaded ${candidates.length} candidates from latest query results`);
    }
    // If last item is a candidate object itself (fallback)
    else if (lastQueryResult && 'cid' in lastQueryResult && lastQueryResult.cid !== undefined) {
      candidates.push({
        cid: String(lastQueryResult.cid),
        name: lastQueryResult.name || `Candidate ${lastQueryResult.cid}`,
        email: lastQueryResult.email || null,
        jd_score: Number(lastQueryResult.jd_score ?? 0),
        jd_reason: lastQueryResult.evaluation || lastQueryResult.evaluation_reason || lastQueryResult.jd_reason || 'Match based on job description',
        total_score: Number(lastQueryResult.total_score ?? lastQueryResult.jd_score ?? 0),
        query_score: lastQueryResult.query_score ? Number(lastQueryResult.query_score) : undefined,
        evaluation_reason: lastQueryResult.evaluation || lastQueryResult.evaluation_reason || lastQueryResult.jd_reason,
      });
      console.log(`✅ Loaded candidate from rankings array`);
    }
  }
  
  return candidates;
}

/**
 * Fetch rankings from Supabase for a session
 * This is the primary source of ranking data after API processing
 */
export async function fetchRankingsFromSupabase(sessionId: string): Promise<RankingsResponse> {
  // Only run in browser
  if (typeof window === 'undefined') {
    throw new Error('fetchRankingsFromSupabase can only be used on the client');
  }
  
  try {
    const supabase = createClient();
    
    // Fetch ranking data from rankings_sighire table
    const { data, error: rankingError } = await supabase
      .from('rankings_sighire')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    if (rankingError) {
      throw new Error(`Supabase error: ${rankingError.message}`);
    }
    
    if (!data) {
      throw new Error('Session not found in Supabase');
    }
    
    console.log('📊 Raw data from rankings_sighire:', {
      id: data.id,
      hasRankings: !!data.rankings,
      rankingsType: typeof data.rankings,
      rankingsLength: Array.isArray(data.rankings) ? data.rankings.length : 'N/A',
      status: data.status
    });
    
    // Parse rankings from Supabase data
    const candidates = parseSupabaseRankings(data);
    
    console.log('✅ Fetched rankings from Supabase:', candidates.length, 'candidates');
    
    // Sort by total_score descending
    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        const scoreA = Number(a.total_score) || 0;
        const scoreB = Number(b.total_score) || 0;
        return scoreB - scoreA;
      });
    }
    
    return {
      candidates,
      queries: data.queries || [],
      rankings: data.rankings,
      status: data.status
    };
  } catch (error) {
    console.error('❌ Error fetching rankings from Supabase:', error);
    throw error;
  }
}

/**
 * Fetch queries for a session from Supabase
 */
export async function fetchQueriesFromSupabase(sessionId: string): Promise<any[]> {
  // Only run in browser
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const supabase = createClient();
    
    const { data, error: queryError } = await supabase
      .from('rankings_sighire')
      .select('queries')
      .eq('id', sessionId)
      .single();
    
    if (queryError || !data) {
      console.warn('⚠️ Could not fetch queries from Supabase');
      return [];
    }
    
    const queries = data.queries || [];
    console.log('✅ Fetched', queries.length, 'queries from Supabase');
    return queries;
  } catch (error) {
    console.error('❌ Error fetching queries from Supabase:', error);
    return [];
  }
}

/**
 * Poll Supabase for session status
 * Useful for checking if processing is complete without waiting for API
 */
export async function pollSessionStatusFromSupabase(
  sessionId: string,
  maxAttempts: number = 30,
  delayMs: number = 1000
): Promise<any> {
  // Only run in browser
  if (typeof window === 'undefined') {
    throw new Error('pollSessionStatusFromSupabase can only be used on the client');
  }
  
  const supabase = createClient();
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { data, error: statusError } = await supabase
        .from('rankings_sighire')
        .select('id, rankings, queries, status')
        .eq('id', sessionId)
        .single();
      
      if (!statusError && data) {
        if (data.status === 'ready') {
          return data;
        }
        
        if (data.status === 'failed') {
          throw new Error('Session processing failed');
        }
      }
    } catch (err) {
      console.error('Error polling session status:', err);
    }
    
    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw new Error('Session processing timeout');
}
