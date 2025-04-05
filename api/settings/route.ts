import { NextResponse } from 'next/server'
import { encrypt, decrypt } from '@/lib/encryption'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, apiKeys } = body

    // Validate the request
    if (!userId || !apiKeys) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Encrypt the API keys before storing
    const encryptedKeys = {
      trelloApiKey: encrypt(apiKeys.trelloApiKey),
      trelloToken: encrypt(apiKeys.trelloToken),
      gmailUser: encrypt(apiKeys.gmailUser),
      gmailPassword: encrypt(apiKeys.gmailPassword),
      gcalendarKey: encrypt(apiKeys.gcalendarKey),
    }

    // Store in database
    await db.apiKeys.upsert({
      where: { userId },
      create: {
        userId,
        ...encryptedKeys,
      },
      update: encryptedKeys,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing API keys:', error)
    return NextResponse.json(
      { error: 'Failed to store API keys' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    const keys = await db.apiKeys.findUnique({
      where: { userId },
    })

    if (!keys) {
      return NextResponse.json({ keys: null })
    }

    // Decrypt the keys before sending
    const decryptedKeys = {
      trelloApiKey: decrypt(keys.trelloApiKey),
      trelloToken: decrypt(keys.trelloToken),
      gmailUser: decrypt(keys.gmailUser),
      gmailPassword: decrypt(keys.gmailPassword),
      gcalendarKey: decrypt(keys.gcalendarKey),
    }

    return NextResponse.json({ keys: decryptedKeys })
  } catch (error) {
    console.error('Error retrieving API keys:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve API keys' },
      { status: 500 }
    )
  }
} 