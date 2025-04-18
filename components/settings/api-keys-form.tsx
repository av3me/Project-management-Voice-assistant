"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  trelloApiKey: z.string().min(1, {
    message: "Trello API Key is required.",
  }),
  trelloToken: z.string().min(1, {
    message: "Trello Token is required.",
  }),
  gmailUser: z.string().email({
    message: "Please enter a valid email address.",
  }),
  gmailPassword: z.string().min(1, {
    message: "Gmail App Password is required.",
  }),
  gcalendarKey: z.string().min(1, {
    message: "Google Calendar API Key is required.",
  }),
})

export function ApiKeysForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session } = useSession()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trelloApiKey: "",
      trelloToken: "",
      gmailUser: "",
      gmailPassword: "",
      gcalendarKey: "",
    },
  })

  useEffect(() => {
    // Load existing API keys if they exist
    const loadApiKeys = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/settings?userId=${session.user.id}`)
          const data = await response.json()
          
          if (data.keys) {
            form.reset(data.keys)
          }
        } catch (error) {
          console.error('Error loading API keys:', error)
        }
      }
    }

    loadApiKeys()
  }, [session?.user?.id, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save API keys.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          apiKeys: values,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save API keys')
      }

      toast({
        title: "Settings saved",
        description: "Your API keys have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API keys. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">API Keys Configuration</h3>
        <p className="text-sm text-muted-foreground">Enter your API keys for integration with external services.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-semibold">Trello Integration</h4>
            </div>

            <FormField
              control={form.control}
              name="trelloApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trello API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter Trello API Key" {...field} />
                  </FormControl>
                  <FormDescription>You can find your Trello API Key in your Trello account settings.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trelloToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trello Token</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter Trello Token" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-semibold">Gmail Integration</h4>
            </div>

            <FormField
              control={form.control}
              name="gmailUser"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gmail Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Gmail email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gmailPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gmail App Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter Gmail App Password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use an App Password generated in your Google Account security settings.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-semibold">Google Calendar Integration</h4>
            </div>

            <FormField
              control={form.control}
              name="gcalendarKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Calendar API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter Google Calendar API Key" {...field} />
                  </FormControl>
                  <FormDescription>You can create an API key in the Google Cloud Console.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save API Keys"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

