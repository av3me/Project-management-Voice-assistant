"use client"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiKeysForm } from "@/components/settings/api-keys-form"
import { TeamMembersForm } from "@/components/settings/team-members-form"
import { RemindersForm } from "@/components/settings/reminders-form"

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your project management assistant.</p>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="api-keys">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="team">Team Members</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys">
            <ApiKeysForm />
          </TabsContent>

          <TabsContent value="team">
            <TeamMembersForm />
          </TabsContent>

          <TabsContent value="reminders">
            <RemindersForm />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

