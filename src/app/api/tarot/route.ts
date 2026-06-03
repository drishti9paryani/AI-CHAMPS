import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

const CARD_TYPES = [
  'The Prompt Wizard',
  'The Workflow Architect',
  'The Curious Hacker',
  'The Automation Monk',
  'The AI Explorer',
  'The Agent Builder',
]

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const { name, department, ai_score } = await req.json()

  const prompt = `You are an AI personality oracle. Based on this person — Name: ${name}, Department: ${department}, AI Score: ${ai_score}/10 — generate ONE tarot card.

Choose card_type from exactly one of: ${CARD_TYPES.join(', ')}.

Return ONLY valid JSON with this exact shape:
{
  "card_type": "The Prompt Wizard",
  "title": "A creative card title (can differ slightly from card_type)",
  "description": "Two sentences describing their AI personality.",
  "strength": "One phrase describing their strength",
  "growth_area": "One phrase describing their growth area",
  "prediction": "One fun sentence about the next 30 days"
}`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    })
    const text = response.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 })

    const card = JSON.parse(jsonMatch[0])

    if (!card.card_type || !CARD_TYPES.includes(card.card_type)) {
      card.card_type = CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)]
    }

    return NextResponse.json(card)
  } catch (err) {
    console.error('Tarot API error:', err)
    return NextResponse.json({ error: 'Failed to generate card' }, { status: 500 })
  }
}
