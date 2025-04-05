import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        ownerId: body.ownerId,
        dueDate: body.dueDate,
        priority: body.priority,
      },
    })
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
} 