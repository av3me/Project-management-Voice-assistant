"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export function RemindersForm() {
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSaveSettings = async () => {
    setIsSubmitting(true)

    try {
      // In a real implementation, this would call the API
      console.log("Saving reminder settings:", { remindersEnabled })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings saved",
        description: "Your reminder settings have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Reminder Settings</h3>
        <p className="text-sm text-muted-foreground">Configure how and when the assistant sends reminders.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Automatic Task Reminders</h4>
              <CardDescription>
                Send automatic reminders for tasks 3 days after creation if not updated.
              </CardDescription>
            </div>
            <Switch checked={remindersEnabled} onCheckedChange={setRemindersEnabled} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}

