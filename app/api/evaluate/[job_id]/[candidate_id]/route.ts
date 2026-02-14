import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ job_id: string; candidate_id: string }> }
) {
  try {
    const { job_id, candidate_id } = await params;

    if (!job_id || !candidate_id) {
      return NextResponse.json(
        { error: 'Missing job_id or candidate_id parameters' },
        { status: 400 }
      );
    }

    // Call the Python FastAPI backend through assignment proxy
    const baseUrl = new URL(request.url).origin;
    const pythonApiUrl = `${baseUrl}/api/assignment-proxy/submission/evaluate/${job_id}/${candidate_id}`;

    const response = await fetch(pythonApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { detail: errorData.detail || 'Evaluation failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Evaluation API error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate submission', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
