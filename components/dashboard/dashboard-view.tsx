import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskList } from "@/components/tasks/task-list"
import { UpcomingMeetings } from "@/components/dashboard/upcoming-meetings"
import { ProjectStats } from "@/components/dashboard/project-stats"

export function DashboardView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle>Welcome to your Project Dashboard</CardTitle>
            <CardDescription>Here's an overview of your project status and upcoming activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectStats />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Tasks Due Soon</CardTitle>
            <CardDescription>Tasks that require your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskList limit={5} showViewAll={true} />
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>Your scheduled meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingMeetings />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

