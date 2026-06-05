import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

const ARCHETYPES = [
  'The Prompt Wizard',
  'The Workflow Architect',
  'The Curious Hacker',
  'The Automation Monk',
  'The AI Explorer',
  'The Agent Builder',
]

export async function POST(req: NextRequest) {
  try {
    const { name, department, ai_score } = await req.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const prompt = `You are generating an AI personality archetype card for an internal employee AI upskilling programme at White Rivers Media, a digital marketing agency.

Employee details:
- Name: ${name}
- Department: ${department}
- AI Readiness Score: ${ai_score}/5

Available archetypes (you MUST choose exactly one):
${ARCHETYPES.map(a => `- ${a}`).join('\n')}

Choose the most fitting archetype based on the department and score. Then write a personalised card for this employee.

Return ONLY valid JSON (no markdown, no extra text):
{
  "title": "<one of the exact archetype names above>",
  "description": "<2-3 sentence description of this archetype tailored to their department and role at a digital agency>",
  "strength": "<one specific strength sentence relevant to their work>",
  "growth_area": "<one specific growth area sentence>",
  "prediction": "<one fun, optimistic prediction about what they will achieve with AI this month>"
}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    })

    const text = response.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    const card = JSON.parse(jsonMatch[0])

    // Validate that the title is one of the allowed archetypes
    if (!ARCHETYPES.includes(card.title)) {
      card.title = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)]
    }

    return NextResponse.json(card)
  } catch (err) {
    console.error('Tarot API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
