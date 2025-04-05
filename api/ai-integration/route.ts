import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    // Define the system prompt for the project management assistant
    const systemPrompt = `
      You are an AI Project Management Assistant that helps users manage projects, tasks, and team coordination.
      You can help with:
      1. Task tracking and management
      2. Meeting scheduling and coordination
      3. Sending reminders and notifications
      4. Explaining project management concepts and methodologies
      5. Providing project status updates and insights
      
      Respond in a professional, helpful tone. Keep responses concise but informative.
      If asked about specific tasks or project details, provide plausible examples since you don't have access to actual project data.
    `

    // Generate a response using the AI SDK
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: message,
      system: systemPrompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Error generating AI response:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

