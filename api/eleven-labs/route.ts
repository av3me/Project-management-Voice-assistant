import { type NextRequest, NextResponse } from "next/server"

// Eleven Labs API endpoint
const ELEVEN_LABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json()

    // Default voice ID if not provided (Bella - a female voice)
    const selectedVoiceId = voiceId || "21m00Tcm4TlvDq8ikWAM"

    // Get API key from environment variable
    const apiKey = process.env.ELEVEN_LABS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Eleven Labs API key not configured" }, { status: 500 })
    }

    // Request to Eleven Labs API
    const response = await fetch(`${ELEVEN_LABS_API_URL}/${selectedVoiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Eleven Labs API error:", errorData)
      return NextResponse.json({ error: "Failed to generate speech" }, { status: response.status })
    }

    // Get the audio data
    const audioArrayBuffer = await response.arrayBuffer()

    // Return the audio data
    return new NextResponse(audioArrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("Error in Eleven Labs API route:", error)
    return NextResponse.json({ error: "Failed to process text-to-speech request" }, { status: 500 })
  }
}

