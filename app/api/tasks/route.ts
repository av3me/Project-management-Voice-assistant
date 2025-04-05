import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const tasks = await db.task.findMany({
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
    const task = await db.task.create({
      data: {
        title: body.title,
        description: body.description,
        ownerId: body.ownerId,
        dueDate: body.dueDate,
        priority: body.priority,
        status: "todo",
      },
    })
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
} 