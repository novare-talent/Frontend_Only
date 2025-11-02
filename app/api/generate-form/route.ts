import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import PDFParser from 'pdf2json'

// Initialize Gemini
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user and check role
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Check if user is admin or client
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 403 }
      )
    }

    if (!['admin', 'client'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only admins and clients can generate forms.' },
        { status: 403 }
      )
    }

    // 3. Parse the request body (now expecting JSON with URL)
    const body = await request.json()
    const { jdUrl, jobTitle, jobDescription } = body

    if (!jdUrl) {
      return NextResponse.json(
        { error: 'JD URL is required' },
        { status: 400 }
      )
    }

    // 4. Fetch PDF from Supabase URL
    console.log('Fetching PDF from:', jdUrl)
    const pdfResponse = await fetch(jdUrl)
    
    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF from URL: ${pdfResponse.statusText}`)
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer())
    console.log(`Downloaded PDF, size: ${pdfBuffer.length} bytes`)

    // 5. Extract text from PDF
    console.log('Extracting text from PDF...')
    const jdText = await extractTextFromPDFBuffer(pdfBuffer)
    
    if (!jdText || jdText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. Please ensure the file is a valid PDF with readable text.' },
        { status: 400 }
      )
    }

    console.log(`Successfully extracted ${jdText.length} characters from PDF`)

    // 6. Generate questions using Gemini
    console.log('Generating questions with Gemini AI...')
    const questions = await generateQuestionsWithGemini(jdText, jobTitle, jobDescription)

    // 7. Return the questions
    return NextResponse.json({
      success: true,
      questions,
      message: 'Form generated successfully'
    })

  } catch (error: any) {
    console.error('Error generating form:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate form' },
      { status: 500 }
    )
  }
}

// Helper function to extract text from PDF buffer using pdf2json
async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF parser
      const pdfParser = new (PDFParser as any)(null, 1)
      
      let parsedText = ''
      
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('PDF Parser Error:', errData.parserError)
        reject(new Error(`Failed to parse PDF: ${errData.parserError}`))
      })
      
      pdfParser.on('pdfParser_dataReady', () => {
        parsedText = (pdfParser as any).getRawTextContent()
        console.log(`Extracted text length: ${parsedText.length}`)
        resolve(parsedText)
      })
      
      // Parse the PDF buffer directly
      pdfParser.parseBuffer(buffer)
      
    } catch (error) {
      console.error('Error in extractTextFromPDFBuffer:', error)
      reject(new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}

// Helper function to generate questions with Gemini
async function generateQuestionsWithGemini(
  jdText: string,
  jobTitle?: string,
  jobDescription?: string
): Promise<any[]> {
  try {
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const systemPrompt = `You are "Founder's Chief Hiring Strategist v2.0" — an expert in designing lean, signal-rich hiring forms for high-impact roles.

Your mission: create a set of questions that screens for conviction, motivation, availability, and skill–role alignment, **not generic data**.

### Core Rules
- Output **pure JSON array only** — no markdown, no text outside JSON.
- The output must be an array of question objects with this schema:
  [
    {
      "type": "text" or "radio" or "multi",
      "title": "Question title",
      "required": true or false,
      "options": ["Option1", "Option2"]  // only for "radio" or "multi"
    }
  ]
- Use "text" for open-ended inputs, "radio" for single-choice, and "multi" for multiple-choice.
- Every "radio" or "multi" question must have **2+ options**.
- **Do NOT** include name, email, LinkedIn, CV, GitHub, or personal info fields — they are already fetched from user profiles.
- Prioritize high-signal questions that:
  - Test technical or domain-specific understanding (based on JD).
  - Gauge motivation, ownership, and mindset (why this role, why now).
  - Assess availability and role fit.
- Be concise, specific, and founder-style direct (no fluff, no HR phrasing).

### Output Style
- Tone: Direct, founder-level clarity.
- Focus: Signal > Noise. Insight > Politeness.
- Number of questions: 10–15, depending on role complexity.

### Example Output Format
[
  {
    "type": "radio",
    "title": "Are you comfortable working full-time from Mumbai?",
    "required": true,
    "options": ["Yes", "Can relocate", "Remote only"]
  },
  {
    "type": "text",
    "title": "Describe one project where you solved a complex technical problem end-to-end.",
    "required": true
  },
  {
    "type": "multi",
    "title": "Which of the following technologies have you worked with?",
    "required": true,
    "options": ["React", "Node.js", "Python", "AWS", "Docker"]
  }
]

IMPORTANT: Return ONLY the JSON array. No markdown code blocks, no explanations, no additional text.`

    const userPrompt = `Generate application form questions based on this Job Description (JD):

${jobTitle ? `Job Title: ${jobTitle}\n\n` : ''}
${jobDescription ? `Job Description: ${jobDescription}\n\n` : ''}

Full JD Text:
${jdText}

Return ONLY a valid JSON array of question objects. No markdown, no explanations.`

    const result = await model.generateContent([systemPrompt, userPrompt])
    const response = await result.response
    let text = response.text().trim()

    console.log('Raw Gemini AI Response length:', text.length)

    // Remove markdown code blocks if present
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Failed to extract JSON. Response preview:', text.substring(0, 500))
      throw new Error('Could not extract valid JSON from AI response')
    }

    const questions = JSON.parse(jsonMatch[0])

    // Validate the questions
    if (!Array.isArray(questions)) {
      throw new Error('AI did not return a valid array of questions')
    }

    if (questions.length === 0) {
      throw new Error('AI returned an empty array of questions')
    }

    // Ensure all questions have required fields
    const validatedQuestions = questions.map((q: any, index: number) => {
      if (!q.type || !q.title) {
        throw new Error(`Question ${index + 1} is missing required fields`)
      }

      if (!['text', 'radio', 'multi'].includes(q.type)) {
        throw new Error(`Question ${index + 1} has invalid type: ${q.type}`)
      }

      if ((q.type === 'radio' || q.type === 'multi') && (!q.options || q.options.length < 2)) {
        throw new Error(`Question ${index + 1} must have at least 2 options`)
      }

      return {
        type: q.type,
        title: q.title,
        required: q.required !== false, // Default to true
        ...(q.options && { options: q.options })
      }
    })

    console.log(`Successfully validated ${validatedQuestions.length} questions`)
    return validatedQuestions
  } catch (error) {
    console.error('Error in generateQuestionsWithGemini:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to generate questions: ${error.message}`)
    }
    throw new Error('Failed to generate questions: Unknown error')
  }
}