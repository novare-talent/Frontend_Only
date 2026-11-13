/**
 * jobs.Applied_Candidates is meant to be an array of profile ids, but legacy
 * rows were written as a JSON string. Readers should always go through this
 * helper so both shapes are handled.
 */
export function parseAppliedCandidates(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  if (typeof value === "string" && value.trim() !== "") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((v): v is string => typeof v === "string");
      }
    } catch {
      // not JSON - ignore
    }
  }
  return [];
}

/** Candidate count for either array, legacy JSON string, or numeric values. */
export function appliedCandidatesCount(value: unknown): number {
  if (typeof value === "number") return value;
  return parseAppliedCandidates(value).length;
}
