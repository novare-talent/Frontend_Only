import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 })
    }

    if (!['admin', 'client'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only admins and clients can generate forms.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { jdUrl, jobId } = body

    if (!jdUrl) {
      return NextResponse.json({ error: 'JD URL is required' }, { status: 400 })
    }

    console.log('Fetching PDF from:', jdUrl)
    const pdfResponse = await fetch(jdUrl)

    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF from URL: ${pdfResponse.statusText}`)
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer())
    console.log(`Downloaded PDF, size: ${pdfBuffer.length} bytes`)

    console.log('Generating form with OpenAI...')
    const formData = await generateFormFromPDF(pdfBuffer)

    const newFormId = uuidv4()

    const mappedQuestions = formData.questions.map((q: any) => ({
      id: uuidv4(),
      type: q.type.toLowerCase() as 'text' | 'radio' | 'multi',
      title: q.title,
      required: true,
      ...(q.options && { options: q.options })
    }))

    const formRecord = {
      form_id: newFormId,
      job_id: jobId || null,
      form: {
        title: formData.title,
        questions: mappedQuestions
      }
    }

    const { data: insertedForm, error: insertError } = await supabase
      .from('forms')
      .insert(formRecord)
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to save form: ${insertError.message}`)
    }

    return NextResponse.json({
      success: true,
      form_id: newFormId,
      title: formData.title,
      questions: mappedQuestions,
      job_id: jobId || null,
      created_at: insertedForm.created_at,
      message: 'Form generated and saved successfully'
    })

  } catch (error: any) {
    console.error('Error generating form:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate form' },
      { status: 500 }
    )
  }
}

async function generateFormFromPDF(buffer: Buffer): Promise<any> {
  const base64Pdf = buffer.toString('base64')

  const systemPrompt = `You are "Founder's Chief Hiring Strategist v2.0" — an expert in designing lean, signal-rich hiring forms for high-impact roles.

Your mission: create a *Google Form JSON* that screens for conviction, motivation, availability, and skill–role alignment, *not generic data*.

### Core Rules
- Output *pure JSON only* — no markdown, no text outside JSON.
- The output must match this schema:
  {
    "title": "Form title",
    "questions": [
      {
        "type": "TEXT" or "RADIO",
        "title": "Question title",
        "options": ["Option1", "Option2"]  // only for RADIO
      }
    ]
  }
- Use "TEXT" for open-ended inputs and "RADIO" for multiple-choice.
- Every "RADIO" question must have *2+ options*.
- *Do NOT* include name, email, LinkedIn, CV, GitHub, or personal info fields — they are already fetched from user profiles.
- Prioritize high-signal questions that:
  - Test technical or domain-specific understanding (based on JD).
  - Gauge motivation, ownership, and mindset (why this role, why now).
  - Assess availability and role fit.
- Be concise, specific, and founder-style direct (no fluff, no HR phrasing).

### Output Style
- Tone: Direct, founder-level clarity.
- Focus: Signal > Noise. Insight > Politeness.
- Number of questions: 10–18, depending on role complexity.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'file',
            file: {
              filename: 'job-description.pdf',
              file_data: `data:application/pdf;base64,${base64Pdf}`
            }
          } as any,
          {
            type: 'text',
            text: 'Generate the Google Form JSON based on this Job Description PDF.'
          }
        ]
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 4000
  })

  const text = completion.choices[0]?.message?.content?.trim() || ''
  console.log('Raw OpenAI Response length:', text.length)

  const formData = JSON.parse(text)

  if (!formData.title || !formData.questions || !Array.isArray(formData.questions)) {
    throw new Error('AI did not return valid form structure')
  }

  if (formData.questions.length === 0) {
    throw new Error('AI returned an empty questions array')
  }

  formData.questions.forEach((q: any, index: number) => {
    if (!q.type || !q.title) {
      throw new Error(`Question ${index + 1} is missing required fields`)
    }
    if (!['TEXT', 'RADIO'].includes(q.type)) {
      throw new Error(`Question ${index + 1} has invalid type: ${q.type}`)
    }
    if (q.type === 'RADIO' && (!q.options || q.options.length < 2)) {
      throw new Error(`Question ${index + 1} must have at least 2 options`)
    }
  })

  console.log(`Successfully validated form with ${formData.questions.length} questions`)
  return formData
}
