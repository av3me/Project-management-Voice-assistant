"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

type Meeting = {
  id: string
  title: string
  date: string
  time: string
  attendees: string[]
}

export function UpcomingMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, this would fetch from the API
    // For now, we'll use mock data
    setTimeout(() => {
      setMeetings([
        {
          id: "1",
          title: "Weekly Team Standup",
          date: "2025-04-08",
          time: "10:00 AM",
          attendees: ["Alice", "Bob", "Charlie"],
        },
        {
          id: "2",
          title: "Project Review",
          date: "2025-04-10",
          time: "2:00 PM",
          attendees: ["Alice", "Dave", "Eve"],
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading meetings...</div>
  }

  if (meetings.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No upcoming meetings scheduled.</p>
        <Button className="mt-4" variant="outline" size="sm">
          Schedule Meeting
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <div key={meeting.id} className="flex flex-col p-4 border rounded-lg">
          <h3 className="font-medium">{meeting.title}</h3>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{meeting.date}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              <span>{meeting.time}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Users className="mr-2 h-4 w-4" />
              <span>{meeting.attendees.join(", ")}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="pt-2">
        <Button variant="outline" size="sm" className="w-full">
          Schedule New Meeting
        </Button>
      </div>
    </div>
  )
}

