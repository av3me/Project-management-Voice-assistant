import { encrypt, decrypt } from '@/lib/encryption'

// Test encryption
const testEncryption = () => {
  const originalText = 'test-api-key-123'
  const encrypted = encrypt(originalText)
  const decrypted = decrypt(encrypted)
  
  console.log('Encryption Test:')
  console.log('Original:', originalText)
  console.log('Encrypted:', encrypted)
  console.log('Decrypted:', decrypted)
  console.log('Test Passed:', originalText === decrypted)
}

// Test database connection
const testDatabase = async () => {
  try {
    const testKeys = {
      userId: 'test-user-123',
      apiKeys: {
        trelloApiKey: 'test-trello-key',
        trelloToken: 'test-trello-token',
        gmailUser: 'test@gmail.com',
        gmailPassword: 'test-gmail-password',
        gcalendarKey: 'test-calendar-key'
      }
    }

    // Test POST
    const postResponse = await fetch('http://localhost:3000/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testKeys),
    })

    console.log('\nDatabase POST Test:')
    console.log('Status:', postResponse.status)
    console.log('Response:', await postResponse.json())

    // Test GET
    const getResponse = await fetch(`http://localhost:3000/api/settings?userId=${testKeys.userId}`)
    
    console.log('\nDatabase GET Test:')
    console.log('Status:', getResponse.status)
    console.log('Response:', await getResponse.json())
  } catch (error) {
    console.error('Database Test Error:', error)
  }
}

// Run tests
const runTests = async () => {
  console.log('Starting API Tests...\n')
  testEncryption()
  await testDatabase()
}

runTests() 