import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { applyRateLimit, limiters } from '@/utils/rateLimit';
import { getCallerUser, UUID_RE } from '@/utils/apiAuth';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// Only the buckets the app actually uploads to, each with its allowed types.
const BUCKETS: Record<string, { mimes: string[]; exts: string[] }> = {
  resumes: {
    mimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    exts: ['pdf', 'doc', 'docx'],
  },
  'profile-images': {
    mimes: ['image/png', 'image/jpeg', 'image/webp'],
    exts: ['png', 'jpg', 'jpeg', 'webp'],
  },
};

// Same-origin only: no CORS headers are emitted, so browsers block cross-origin use.
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const limited = await applyRateLimit(limiters.uploadResume, `upload:${ip}`);
    if (limited) return limited;

    const formData = await request.formData();
    const file = formData.get('file');
    const userIdRaw = formData.get('user_id');
    const bucketRaw = formData.get('bucket');
    const userId = typeof userIdRaw === 'string' ? userIdRaw : null;
    const bucket = typeof bucketRaw === 'string' && bucketRaw ? bucketRaw : 'resumes';

    if (!(file instanceof File) || !userId) {
      return NextResponse.json({ error: 'Missing required fields: file, user_id' }, { status: 400 });
    }
    if (!UUID_RE.test(userId)) {
      return NextResponse.json({ error: 'Invalid user_id' }, { status: 400 });
    }

    const rule = Object.prototype.hasOwnProperty.call(BUCKETS, bucket) ? BUCKETS[bucket] : null;
    if (!rule) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File must be between 1 byte and 5MB' }, { status: 413 });
    }

    const ext = (file.name.split('.').pop() ?? '').toLowerCase();
    if (!rule.mimes.includes(file.type) || !rule.exts.includes(ext)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    // Signup may call this before a session exists (e.g. pending email confirmation),
    // so a session is optional - but if one exists it must belong to user_id.
    const caller = await getCallerUser(request);
    if (caller && caller.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const baseName = file.name
      .replace(/\.[^.]*$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 60) || 'file';
    const storagePath = `${userId}/${Date.now()}_${baseName}.${ext}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('[upload-resume] storage error:', error.message);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 200 });
  } catch (err) {
    console.error('[upload-resume] error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
