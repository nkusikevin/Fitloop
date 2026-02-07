import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
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

export async function POST(request: Request) {
  try {
    const { resume, jobPosting } = await request.json()

    if (!resume?.trim() || !jobPosting?.trim()) {
      return Response.json({ error: 'Missing resume or job posting' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate analysis using AI
    const { object } = await generateObject({
      model: openai('gpt-4-turbo'),
      schema: analysisSchema,
      prompt: `You are an expert HR recruiter and career coach. Analyze how well this resume matches the job posting.

RESUME:
${resume}

JOB POSTING:
${jobPosting}

Provide a detailed analysis with the schema specified. Be objective and constructive. The overall score should reflect how well the resume aligns with the job requirements (0-100).`,
    })

    // Save to database
    const { data, error } = await supabase.from('resume_sessions').insert({
      user_id: user.id,
      resume_text: resume,
      job_posting_text: jobPosting,
      overall_score: object.overallScore,
      match_percentage: object.matchPercentage,
      matched_skills: object.matchedSkills,
      missing_skills: object.missingSkills,
      matched_experience: object.matchedExperience,
      gap_areas: object.gapAreas,
      strengths: object.strengths,
      recommendations: object.recommendations,
      summary: object.summary,
    })

    if (error) {
      console.error('Database error:', error)
      return Response.json({ error: 'Failed to save analysis' }, { status: 500 })
    }

    return Response.json({
      id: data?.[0]?.id,
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
