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
      prompt: `You are an expert HR recruiter and career coach with 20+ years of experience. Analyze how well this resume matches the job posting using a systematic scoring approach.

RESUME:
${resume}

JOB POSTING:
${jobPosting}

SCORING METHODOLOGY:
Calculate the overall score (0-100) based on these weighted criteria:

1. REQUIRED SKILLS MATCH (40% weight):
   - Identify all required/must-have skills from the job posting
   - Count how many are present in the resume
   - Score = (skills_matched / total_required_skills) * 40

2. EXPERIENCE ALIGNMENT (30% weight):
   - Years of experience match (10%)
   - Industry/domain relevance (10%)
   - Role-level appropriateness (10%)

3. PREFERRED QUALIFICATIONS (20% weight):
   - Nice-to-have skills present
   - Certifications or education match
   - Additional relevant experience

4. PRESENTATION & KEYWORDS (10% weight):
   - Relevant keywords from job posting in resume
   - Professional formatting indicators
   - Clear achievement descriptions

IMPORTANT SCORING GUIDELINES:
- Be precise and realistic - don't inflate scores
- A score of 80+ should indicate a very strong match (interview-worthy)
- A score of 60-79 indicates a moderate match with some gaps
- A score of 40-59 indicates significant gaps but some transferable skills
- A score below 40 indicates poor alignment
- matchPercentage should equal overallScore

For missingSkills: List ONLY skills explicitly required in the job posting that are NOT mentioned in the resume.
For matchedSkills: List ONLY skills from the resume that DIRECTLY match job requirements.
For recommendations: Provide specific, actionable improvements the candidate can make to strengthen their application.

Be thorough but fair in your assessment.`,
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
