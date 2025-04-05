"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/tasks/task-list"
import { TaskForm } from "@/components/tasks/task-form"

export function TaskConsole() {
  const [activeTab, setActiveTab] = useState("view")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground">Create, view, and manage your project tasks.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>Create, view, and manage your project tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="view" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="view">View Tasks</TabsTrigger>
              <TabsTrigger value="create">Create Task</TabsTrigger>
            </TabsList>

            <TabsContent value="view">
              <TaskList />
            </TabsContent>

            <TabsContent value="create">
              <TaskForm onSuccess={() => setActiveTab("view")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

