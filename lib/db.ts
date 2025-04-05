import { Pool } from '@neondatabase/serverless'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)
const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

declare global {
  var db: undefined | ReturnType<typeof prismaClientSingleton>
}

export const db = globalThis.db ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.db = db 