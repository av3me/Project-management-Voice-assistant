"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

type Task = {
  id: string
  title: string
  description: string | null
  dueDate: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  owner: {
    name: string
    initials: string
  }
}

export function TaskList({
  limit = 10,
  showViewAll = false,
}: {
  limit?: number
  showViewAll?: boolean
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks")
        if (!response.ok) throw new Error("Failed to fetch tasks")
        const data = await response.json()
        setTasks(data)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  if (loading) {
    return <div className="py-4 text-center text-muted-foreground">Loading tasks...</div>
  }

  if (tasks.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        <p>No tasks found.</p>
        <Button className="mt-4" variant="outline" size="sm" asChild>
          <Link href="/tasks">Create Task</Link>
        </Button>
      </div>
    )
  }

  const limitedTasks = limit ? tasks.slice(0, limit) : tasks
  const today = new Date()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {limitedTasks.map((task) => {
          const dueDate = new Date(task.dueDate)
          const isOverdue = dueDate < today && task.status !== "done"

          return (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3 border rounded-lg ${
                isOverdue ? "border-red-400 bg-red-50" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{task.owner.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium flex items-center">
                    {task.title}
                    {isOverdue && <AlertCircle className="ml-2 h-4 w-4 text-red-500" />}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
              <Badge
                variant={task.status === "done" ? "outline" : task.status === "in-progress" ? "secondary" : "default"}
              >
                {task.status === "todo" ? "To Do" : task.status === "in-progress" ? "In Progress" : "Done"}
              </Badge>
            </div>
          )
        })}
      </div>

      {showViewAll && tasks.length > limit && (
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/tasks">View All Tasks</Link>
        </Button>
      )}
    </div>
  )
}

