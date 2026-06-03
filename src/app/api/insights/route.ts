import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

export interface InsightsResponse {
  summary: string
  challenges: string[]
  trainingSessions: string[]
  interventions: string[]
}

export async function POST(req: NextRequest) {
  try {
    const { submissions } = await req.json()

    if (!submissions?.length) {
      return NextResponse.json({ error: 'No submissions provided' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const formatted = submissions
      .map(
        (
          s: {
            name: string
            department: string
            current_project: string
            challenge: string
            support_needed: string
          },
          i: number
        ) =>
          `${i + 1}. [${s.department}] ${s.name}: Project: ${s.current_project} | Challenge: ${s.challenge} | Support: ${s.support_needed}`
      )
      .join('\n')

    const prompt = `You are an internal L&D analyst for an AI upskilling program. Analyze these AI Champ form submissions:

${formatted}

Return ONLY valid JSON (no markdown fences) with this exact structure:
{
  "summary": "2-3 sentence executive summary of overall patterns",
  "challenges": ["challenge 1", "challenge 2", "challenge 3"],
  "trainingSessions": ["training session 1", "training session 2", "training session 3"],
  "interventions": ["intervention 1", "intervention 2", "intervention 3"]
}

Be specific, actionable, and reference patterns you see across departments.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    })
    const text = response.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    const insights: InsightsResponse = JSON.parse(jsonMatch[0])
    return NextResponse.json({ insights })
  } catch (err) {
    console.error('Insights API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
