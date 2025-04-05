"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { ChatMessage } from "@/components/chat/chat-message"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your Project Management Assistant. I can help you track tasks, schedule meetings, send reminders, and understand project management concepts. What would you like help with today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSendMessage() {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      // In a real implementation, this would call the API
      // For now, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let response = ""
      const lowerInput = input.toLowerCase()

      // Task-related queries
      if (lowerInput.includes("tasks") && lowerInput.includes("due")) {
        response =
          "You have 3 tasks due this week: 'Prepare Q1 Report' due on April 10, 'Update client presentation' due on April 7, and 'Review marketing materials' due on April 5. Would you like me to send reminders to the assignees?"
      }
      // Help with understanding project management
      else if (
        lowerInput.includes("help") &&
        lowerInput.includes("understand") &&
        lowerInput.includes("project management")
      ) {
        response =
          "I'd be happy to help you understand project management! Project management involves planning, organizing, and overseeing projects to achieve specific goals within constraints like time and budget. In this app, you can:\n\n1. Create and track tasks on the Tasks page\n2. View project status on the Dashboard\n3. Schedule meetings and send reminders through me\n4. Configure team members and integrations in Settings\n\nWhat specific aspect of project management would you like to learn more about?"
      }
      // Explain specific PM concepts
      else if (lowerInput.includes("what") && lowerInput.includes("gantt chart")) {
        response =
          "A Gantt chart is a visual project management tool that shows a project's tasks or activities displayed against time. It helps you see:\n\n• What tasks need to be completed\n• When each task begins and ends\n• How long each task will take\n• Where tasks overlap and by how much\n• The start and end date of the entire project\n\nWhile this app doesn't currently have Gantt charts, you can track task deadlines and dependencies through the Tasks page. Would you like me to explain other project management concepts?"
      } else if (lowerInput.includes("what") && lowerInput.includes("agile")) {
        response =
          "Agile is a project management approach that breaks projects into small, manageable phases called 'sprints.' It emphasizes:\n\n• Iterative development\n• Team collaboration\n• Customer feedback\n• Flexibility to change\n\nAgile methodologies include Scrum and Kanban. This app supports Agile workflows through task management and regular check-ins. Would you like me to explain how to set up an Agile workflow in this tool?"
      }
      // Explain app features
      else if (lowerInput.includes("what can you do") || lowerInput.includes("help me with")) {
        response =
          "I can help you manage your project in several ways:\n\n• Track tasks and deadlines (try asking 'What tasks are due?')\n• Send reminders to team members (try 'Remind Alice about the Q1 report')\n• Schedule meetings (try 'Schedule a meeting with the team on Monday at 10am')\n• Provide project status updates (try 'How is the project going?')\n• Answer questions about project management concepts\n\nWhat would you like help with today?"
      }
      // Reminder functionality
      else if (lowerInput.includes("remind") && lowerInput.match(/remind\s+(\w+)/)) {
        const person = lowerInput.match(/remind\s+(\w+)/)[1]
        const taskMatch = lowerInput.match(/about\s+(.+?)(?:$|\s+by|\s+on)/)
        const task = taskMatch ? taskMatch[1] : "their tasks"
        response = `I've sent a reminder to ${person.charAt(0).toUpperCase() + person.slice(1)} about ${task}. They'll receive an email notification shortly. Would you like me to follow up if they don't respond within 24 hours?`
      }
      // Meeting scheduling with more details
      else if (lowerInput.includes("schedule") && lowerInput.includes("meeting")) {
        if (lowerInput.includes("on") && lowerInput.includes("at")) {
          const dateMatch = lowerInput.match(/on\s+(\w+(?:\s+\d+)?)/)
          const timeMatch = lowerInput.match(/at\s+(\d+(?::\d+)?\s*(?:am|pm)?)/)
          const attendeesMatch = lowerInput.match(/with\s+(.+?)(?:\s+on|\s+at|\s*$)/)

          const date = dateMatch ? dateMatch[1] : "Monday"
          const time = timeMatch ? timeMatch[1] : "10:00 AM"
          const attendees = attendeesMatch ? attendeesMatch[1] : "the team"

          response = `I've scheduled a meeting on ${date} at ${time} with ${attendees}. Calendar invites have been sent to all participants. Would you like me to prepare an agenda for this meeting?`
        } else {
          response =
            "I'd be happy to schedule a meeting. Could you provide more details?\n\n• When should it take place? (date and time)\n• Who should attend?\n• What's the purpose of the meeting?\n\nFor example, you could say: 'Schedule a project review meeting with Alice and Bob on Friday at 2pm'"
        }
      }
      // Project status with more details
      else if (
        lowerInput.includes("project") &&
        (lowerInput.includes("status") || lowerInput.includes("progress") || lowerInput.includes("going"))
      ) {
        response =
          "The project is progressing well. Here's a summary:\n\n• Tasks: 12 total, 5 completed (42% completion rate)\n• Timeline: Currently on schedule\n• Upcoming deadlines: 3 tasks due in the next 3 days\n• Risks: 1 overdue task that needs attention\n• Next milestone: Client presentation on April 15\n\nWould you like me to send a detailed status report to the team?"
      }
      // How to use specific features
      else if (lowerInput.includes("how") && lowerInput.includes("create") && lowerInput.includes("task")) {
        response =
          "To create a new task:\n\n1. Go to the Tasks page\n2. Click on the 'Create Task' tab\n3. Fill in the task details (title, description, assignee, due date)\n4. Click 'Create Task'\n\nThe task will be added to your project and synced with Trello. Would you like me to create a task for you now?"
      } else if (lowerInput.includes("how") && lowerInput.includes("dashboard")) {
        response =
          "The Dashboard provides an overview of your project status. It shows:\n\n• Key metrics (total tasks, completed tasks, etc.)\n• Tasks due soon\n• Upcoming meetings\n\nIt's designed to give you a quick snapshot of project health and upcoming activities. You can click on any section to see more details. Is there a specific part of the Dashboard you'd like to understand better?"
      }
      // Default response with suggestions
      else {
        response =
          "I'm here to help with your project management needs. You can ask me about:\n\n• Tasks and deadlines\n• Scheduling meetings\n• Sending reminders\n• Project status updates\n• Project management concepts\n\nFor example, try asking 'What tasks are due?' or 'Help me understand Agile methodology'"
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error processing message:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project Assistant</h1>
        <p className="text-muted-foreground">Chat with your AI project management assistant.</p>
      </div>

      <Card className="h-[calc(100vh-240px)] flex flex-col">
        <CardHeader>
          <CardTitle>Assistant Chat</CardTitle>
          <CardDescription>Ask questions or give commands to manage your project</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center space-x-2">
            <Input
              placeholder="Ask the project assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!input.trim() || isProcessing} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => setInput("What tasks are due?")}
              className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full"
            >
              What tasks are due?
            </button>
            <button
              onClick={() => setInput("Help me understand project management")}
              className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full"
            >
              Help me understand project management
            </button>
            <button
              onClick={() => setInput("What can you do?")}
              className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full"
            >
              What can you do?
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

