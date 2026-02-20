import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'

// Schema for improved resume content
const improvedResumeSchema = z.object({
  summary: z.string().describe('Improved professional summary tailored to the job'),
  skills: z.array(z.string()).describe('Optimized list of skills aligned with job requirements'),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    duration: z.string(),
    achievements: z.array(z.string()).describe('Bullet points highlighting achievements with quantifiable results where possible'),
  })).describe('Enhanced work experience with impactful achievements'),
  improvements: z.array(z.object({
    section: z.string(),
    original: z.string(),
    improved: z.string(),
    reason: z.string(),
  })).describe('Specific improvements made with explanations'),
  keywordMatches: z.array(z.string()).describe('Keywords from job posting now incorporated into resume'),
  additionalSuggestions: z.array(z.string()).describe('Additional suggestions for the candidate to consider'),
})

// Helper function to get the appropriate AI model
function getAIModel(apiKey: string, provider: string, modelName: string) {
  switch (provider) {
    case 'openai': {
      const openaiClient = createOpenAI({
        apiKey: apiKey,
      })
      return openaiClient(modelName || 'gpt-4o')
    }
    case 'anthropic': {
      const anthropicClient = createAnthropic({
        apiKey: apiKey,
      })
      return anthropicClient(modelName || 'claude-3-5-sonnet-20241022')
    }
    case 'google': {
      const googleClient = createGoogleGenerativeAI({
        apiKey: apiKey,
      })
      return googleClient(modelName || 'gemini-1.5-pro-latest')
    }
    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { resume, jobPosting, apiKey, provider, modelName, analysisData } = body

    if (!resume?.trim() || !jobPosting?.trim()) {
      return Response.json({ error: 'Missing resume or job posting' }, { status: 400 })
    }

    if (!apiKey || !provider || !modelName) {
      return Response.json({ error: 'Missing API key configuration' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the appropriate AI model
    const model = getAIModel(apiKey, provider, modelName)

    // Generate improved resume content
    const { object } = await generateObject({
      model,
      schema: improvedResumeSchema,
      prompt: `You are an expert resume writer and career coach. Your task is to improve this resume to better match the job posting while maintaining authenticity.

IMPORTANT GUIDELINES:
1. DO NOT fabricate experience or skills the candidate doesn't have
2. Rewrite existing content to highlight relevant skills and achievements
3. If the original resume includes metrics, keep or refine them. If metrics are missing, suggest adding them as placeholders like "[X%]" or "[X projects]" that the candidate can fill in - DO NOT invent specific numbers
4. Use strong action verbs and industry-specific keywords from the job posting
5. Optimize the professional summary to address key job requirements
6. Reorganize skills to prioritize those mentioned in the job posting
7. Rephrase achievements to align with what the employer is seeking

ORIGINAL RESUME:
${resume}

JOB POSTING:
${jobPosting}

${analysisData ? `ANALYSIS RESULTS:
- Missing Skills: ${analysisData.missingSkills?.join(', ') || 'None identified'}
- Gap Areas: ${analysisData.gapAreas?.join(', ') || 'None identified'}
- Recommendations: ${analysisData.recommendations?.join(', ') || 'None'}
` : ''}

Generate an improved version of this resume that:
1. Has a compelling professional summary tailored to this specific job
2. Highlights skills that match the job requirements (only include skills the candidate actually has)
3. Enhances experience bullet points with stronger action verbs and achievement-focused language
4. Incorporates relevant keywords from the job posting naturally
5. Addresses identified gaps by reframing existing experience where applicable
6. Uses placeholder brackets like "[X]" for any suggested metrics the candidate should fill in

For each improvement, explain the specific change and why it makes the resume stronger.`,
    })

    return Response.json(object)
  } catch (error) {
    console.error('Resume improvement error:', error)
    return Response.json(
      { error: 'Failed to improve resume' },
      { status: 500 }
    )
  }
}
