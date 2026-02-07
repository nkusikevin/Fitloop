import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'

const analysisSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall compatibility score 0-100'),
  matchPercentage: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()).describe('Skills from resume that match job requirements'),
  missingSkills: z.array(z.string()).describe('Important skills from job that are missing in resume'),
  matchedExperience: z.array(z.string()).describe('Experience areas that align with job'),
  gapAreas: z.array(z.string()).describe('Experience gaps or weaknesses'),
  strengths: z.array(z.string()).describe('Key strengths of the resume for this role'),
  recommendations: z.array(z.string()).describe('Specific recommendations to improve match'),
  summary: z.string().describe('Brief professional summary of the analysis'),
})

// Helper function to get the appropriate AI model
function getAIModel(apiKey: string, provider: string, modelName: string) {
  console.log('🔑 getAIModel - Received API key length:', apiKey?.length)
  console.log('🔑 getAIModel - API key preview:', apiKey?.substring(0, 10) + '...')

  // Create the appropriate provider client with API key
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
    const { resume, jobPosting, apiKey, provider, modelName } = body

    console.log('📥 API Route - Received request')
    console.log('📊 API Route - Body keys:', Object.keys(body))
    console.log('🔍 API Route - Validation:', {
      hasResume: !!resume,
      hasJobPosting: !!jobPosting,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      apiKey: apiKey,
      provider,
      modelName
    })

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

    console.log('🔧 API Route - Creating model with provider:', provider, 'model:', modelName)

    // Get the appropriate AI model based on provided configuration
    const model = getAIModel(apiKey, provider, modelName)

    console.log('✅ API Route - Model created successfully')

    // Generate analysis using AI
    console.log('🤖 API Route - Starting AI generation...')
    const { object } = await generateObject({
      model,
      schema: analysisSchema,
      prompt: `You are an expert HR recruiter and career coach. Analyze how well this resume matches the job posting.

RESUME:
${resume}

JOB POSTING:
${jobPosting}

Provide a detailed analysis with the schema specified. Be objective and constructive. The overall score should reflect how well the resume aligns with the job requirements (0-100).`,
    })

    console.log('✅ API Route - AI generation completed successfully')

    // Try to save to database (optional - won't fail if schema is outdated)
    try {
      const { data, error } = await supabase.from('resume_sessions').insert({
        user_id: user.id,
        resume_text: resume,
        job_description_text: jobPosting,
        fit_summary: object.summary,
        gap_areas: object.gapAreas.join('\n'),
        gap_analysis: {
          overall_score: object.overallScore,
          match_percentage: object.matchPercentage,
          matched_skills: object.matchedSkills,
          missing_skills: object.missingSkills,
          matched_experience: object.matchedExperience,
          gap_areas: object.gapAreas,
          strengths: object.strengths,
          recommendations: object.recommendations,
        },
      })

      if (error) {
        console.warn('⚠️ Database save failed (non-critical):', error)
      } else {
        console.log('💾 Saved to database successfully')
      }
    } catch (dbError) {
      console.warn('⚠️ Database save error (non-critical):', dbError)
    }

    return Response.json({
      ...object,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return Response.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    )
  }
}
