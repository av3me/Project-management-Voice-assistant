"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Clock, AlertCircle, Calendar } from "lucide-react"

export function ProjectStats() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    dueSoon: 0,
    overdue: 0,
    upcomingMeetings: 0,
  })

  useEffect(() => {
    // In a real implementation, this would fetch from the API
    // For now, we'll use mock data
    setStats({
      totalTasks: 12,
      completedTasks: 5,
      dueSoon: 3,
      overdue: 1,
      upcomingMeetings: 2,
    })
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Tasks"
        value={`${stats.completedTasks}/${stats.totalTasks}`}
        icon={CheckCircle2}
        description="Completed"
      />
      <StatCard title="Due Soon" value={stats.dueSoon.toString()} icon={Clock} description="Next 3 days" />
      <StatCard
        title="Overdue"
        value={stats.overdue.toString()}
        icon={AlertCircle}
        description="Needs attention"
        alert={stats.overdue > 0}
      />
      <StatCard title="Meetings" value={stats.upcomingMeetings.toString()} icon={Calendar} description="Upcoming" />
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  alert = false,
}: {
  title: string
  value: string
  icon: any
  description: string
  alert?: boolean
}) {
  return (
    <Card className={alert ? "border-red-400" : ""}>
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className={`rounded-full p-2 ${alert ? "bg-red-100" : "bg-muted"}`}>
          <Icon className={`h-5 w-5 ${alert ? "text-red-500" : ""}`} />
        </div>
        <h3 className="mt-2 font-medium text-sm">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

