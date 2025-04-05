"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.string().min(1, {
    message: "Role is required.",
  }),
})

type TeamMember = {
  id: string
  name: string
  email: string
  role: string
}

export function TeamMembersForm() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
    },
  })

  useEffect(() => {
    // In a real implementation, this would fetch from the API
    // For now, we'll use mock data
    setTimeout(() => {
      setTeamMembers([
        {
          id: "1",
          name: "Alice Smith",
          email: "alice@example.com",
          role: "Project Manager",
        },
        {
          id: "2",
          name: "Bob Johnson",
          email: "bob@example.com",
          role: "Developer",
        },
        {
          id: "3",
          name: "Charlie Davis",
          email: "charlie@example.com",
          role: "Designer",
        },
        {
          id: "4",
          name: "Dave Wilson",
          email: "dave@example.com",
          role: "Marketing",
        },
        {
          id: "5",
          name: "Eve Brown",
          email: "eve@example.com",
          role: "Content Writer",
        },
      ])
      setIsLoading(false)
    }, 500)
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // In a real implementation, this would call the API
      console.log("Adding team member:", values)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add the new member to the list
      const newMember: TeamMember = {
        id: (teamMembers.length + 1).toString(),
        ...values,
      }

      setTeamMembers([...teamMembers, newMember])

      toast({
        title: "Team member added",
        description: `${values.name} has been added to the team.`,
      })

      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Team Members</h3>
        <p className="text-sm text-muted-foreground">
          Manage your team members for task assignment and meeting scheduling.
        </p>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Loading team members...
                </TableCell>
              </TableRow>
            ) : teamMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No team members found.
                </TableCell>
              </TableRow>
            ) : (
              teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.role}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-sm font-semibold mb-4">Add Team Member</h4>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter role" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Team Member"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

