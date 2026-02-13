const API_BASE_URL = process.env.NEXT_PUBLIC_RANKING_API_URL || "/api/ranking-proxy";

interface InitSessionResponse {
  session_id: string;
  [key: string]: any;
}

interface UploadResponse {
  success: boolean;
  message?: string;
  session_id?: string;
  [key: string]: any;
}

export interface SessionStatusResponse {
  status: "initialized" | "processing" | "ready" | "failed" | "not_found";
  candidates_count: number;
  error?: string;
  error_details?: string;
  [key: string]: any;
}

export interface Candidate {
  cid: string;
  name: string;
  email: string | null;
  jd_score: number;
  jd_reason: string;
  query_score?: number;
  total_score?: number;
  evaluation_reason?: string;
}

export interface RankingsResponse {
  candidates: Candidate[];
  queries?: Array<any>;
  [key: string]: any;
}

export async function initializeSession(profileId: string): Promise<InitSessionResponse> {
  try {
    const payload = { profile_id: profileId };
    
    const response = await fetch(`${API_BASE_URL}/sessions/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails = "";
      
      try {
        const error = await response.json();
        errorDetails = JSON.stringify(error, null, 2);
        errorMessage = error.detail || error.message || errorMessage;
      } catch {
        errorMessage = `Failed to initialize session - ${response.statusText}`;
      }
      
      throw new Error(`${errorMessage}\n\nPayload sent: ${JSON.stringify(payload)}\n\nAPI Response: ${errorDetails}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Unable to connect to ranking service");
  }
}

export async function uploadSessionData(
  sessionId: string,
  jobDescription: string,
  jobFile: File | null,
  candidatesCSV: string,
  candidatesFile: File | null
): Promise<UploadResponse> {
  try {
    const formData = new FormData();

    // API requires BOTH csv_file and jd_file as actual File objects
    let csvFile: File | null = null;
    let jdFile: File | null = null;

    // Handle CSV file
    if (candidatesFile) {
      csvFile = candidatesFile;
    } else if (candidatesCSV) {
      // Create CSV file from text
      csvFile = new File([candidatesCSV], "candidates.csv", { type: "text/csv" });
    }

    // Handle JD file - MUST be a PDF file
    if (jobFile) {
      // User uploaded a file - use it directly
      jdFile = jobFile;
    } else if (jobDescription) {
      // User entered text - convert to text file (backend will handle)
      // Note: Backend expects PDF but will accept text files too
      jdFile = new File([jobDescription], "job_description.txt", {
        type: "text/plain",
      });
    }

    // Validate both files exist
    if (!csvFile) {
      throw new Error("Candidates CSV file is required. Please upload or paste candidate data.");
    }
    if (!jdFile) {
      throw new Error("Job description file is required. Please upload or paste the job description.");
    }

    // Append with exact field names the API expects
    formData.append("csv_file", csvFile);
    formData.append("jd_file", jdFile);

    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Failed to upload files (HTTP ${response.status})`;
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    // Verify we got a session_id back
    if (!result.session_id) {
      throw new Error("Upload successful but no session_id returned from server");
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Unable to connect to ranking service");
  }
}

export async function checkSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch {
        errorMessage = `Failed to check session status - ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // The response should include status and potentially error details
    // Based on Supabase table, it can have an 'error' field
    return {
      status: data.status || "unknown",
      candidates_count: data.candidates_count || 0,
      error: data.error || undefined,
      error_details: data.error_details || undefined,
      ...data
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Unable to connect to ranking service");
  }
}

export async function waitForSessionReady(
  sessionId: string,
  maxAttempts: number = 5,
  delayMs: number = 2000,
  onStatusChange?: (status: string) => void
): Promise<SessionStatusResponse> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const status = await checkSessionStatus(sessionId);
      
      if (onStatusChange) {
        const statusMsg = status.error 
          ? `${status.status} - ${status.error}` 
          : status.status;
        onStatusChange(statusMsg);
      }

      if (status.status === "ready") {
        return status;
      }

      if (status.status === "failed" || status.status === "not_found") {
        const errorMsg = status.error 
          ? `${status.error}${status.error_details ? '\n' + status.error_details : ''}`
          : `Session processing failed with status: ${status.status}`;
        throw new Error(errorMsg);
      }

      // Status is still "initialized" or "processing", wait and try again
      attempts++;
      
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        // Max attempts reached while still processing
        throw new Error(
          `Session processing timeout after ${maxAttempts} attempts. Status: ${status.status}\n\nThis usually means:\n1. The CSV or JD file format is incorrect\n2. Missing required columns in CSV\n3. Backend service is experiencing issues\n\nPlease check your files and try again.`
        );
      }
    } catch (error) {
      if (attempts >= maxAttempts - 1) {
        throw error;
      }
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error("Session processing timeout - took too long to complete");
}

function extractCandidatesFromResults(results: any[]): Candidate[] {
  const candidates: Candidate[] = [];
  
  if (!Array.isArray(results)) {
    console.warn('⚠️ extractCandidatesFromResults: input is not an array', typeof results);
    return candidates;
  }
  
  results.forEach((candidateData: any, index: number) => {
    try {
      if (!candidateData || typeof candidateData !== 'object') {
        console.warn(`⚠️ Skipping item ${index}: not an object`);
        return;
      }
      
      const cid = String(candidateData.cid ?? index);
      const jdScore = Number(candidateData.jd_score ?? 0);
      const totalScore = Number(candidateData.total_score ?? jdScore ?? 0);
      const queryScore = candidateData.query_score !== undefined ? Number(candidateData.query_score) : undefined;
      
      candidates.push({
        cid,
        name: candidateData.name || `Candidate ${cid}`,
        email: candidateData.email || null,
        jd_score: jdScore,
        jd_reason: candidateData.jd_reason || 'Match based on job description',
        total_score: totalScore,
        query_score: queryScore,
      });
    } catch (err) {
      console.error(`❌ Error processing candidate at index ${index}:`, err, candidateData);
    }
  });
  
  return candidates;
}

export async function fetchRankings(sessionId: string): Promise<RankingsResponse> {
  // Primary: Fetch from Supabase (source of truth after API processing)
  if (typeof window !== 'undefined') {
    try {
      const { fetchRankingsFromSupabase } = await import('./supabase-rankings');
      return await fetchRankingsFromSupabase(sessionId);
    } catch (supabaseError) {
      console.warn('⚠️ Supabase fetch failed, trying API fallback:', supabaseError);
    }
  }
  
  // Fallback: Try API
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/rankings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    let candidates: Candidate[] = [];

    if (!Array.isArray(data.rankings) || data.rankings.length === 0) {
      return { candidates: [], queries: data.queries || [], ...data };
    }

    let lastQueryResults = null;
    for (let i = data.rankings.length - 1; i >= 0; i--) {
      if (data.rankings[i]?.results && Array.isArray(data.rankings[i].results)) {
        lastQueryResults = data.rankings[i];
        break;
      }
    }
    if (lastQueryResults) {
      candidates = extractCandidatesFromResults(lastQueryResults.results);
    } else if (data.rankings[0] && typeof data.rankings[0] === 'object' && 'cid' in data.rankings[0]) {
      candidates = extractCandidatesFromResults(data.rankings);
    }
    if (candidates.length > 0) {
      candidates.sort((a, b) => (Number(b.total_score) || 0) - (Number(a.total_score) || 0));
    }
    return {
      candidates,
      queries: data.queries || [],
      ...data
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch rankings: ${error instanceof Error ? error.message : error}`
    );
  }
}

export async function removeQuery(sessionId: string, queryId: string): Promise<RankingsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/queries/${queryId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch {
        errorMessage = `Failed to remove query - ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // After API succeeds, fetch fresh data from Supabase
    if (typeof window !== 'undefined') {
      try {
        const { fetchRankingsFromSupabase } = await import('./supabase-rankings');
        const supabaseData = await fetchRankingsFromSupabase(sessionId);
        console.log('✅ Query removed. Fresh rankings fetched from Supabase');
        return supabaseData;
      } catch (supabaseErr) {
        console.warn('⚠️ Could not fetch from Supabase, using API response');
      }
    }
    
    // Fallback to API response
    const data = await response.json();
    const candidates = extractCandidatesFromResults(data.results || []);
    return {
      candidates,
      queries: data.queries || [],
      ...data
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Unable to remove query from service");
  }
}

export async function submitQuery(sessionId: string, queryText: string): Promise<RankingsResponse> {
  try {
    // Call API to submit query
    const payload = { query: queryText };
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch {
        errorMessage = `Failed to submit query - ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // After API succeeds, fetch fresh data from Supabase instead of using API response
    if (typeof window !== 'undefined') {
      try {
        const { fetchRankingsFromSupabase } = await import('./supabase-rankings');
        const supabaseData = await fetchRankingsFromSupabase(sessionId);
        console.log('✅ Query submitted. Fresh rankings fetched from Supabase');
        return supabaseData;
      } catch (supabaseErr) {
        console.warn('⚠️ Could not fetch from Supabase, using API response');
      }
    }
    
    // Fallback to API response
    const data = await response.json();
    const candidates = extractCandidatesFromResults(data.results || []);
    return {
      candidates,
      queries: data.queries || [],
      ...data
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Unable to submit query to service");
  }
}