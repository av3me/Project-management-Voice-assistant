import { format } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === "assistant"

  // Format message content to handle line breaks
  const formattedContent = message.content.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      {i < message.content.split("\n").length - 1 && <br />}
    </span>
  ))

  return (
    <div className={cn("flex items-start gap-3 max-w-[85%]", isAssistant ? "" : "ml-auto")}>
      {isAssistant && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">PM</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "rounded-lg px-4 py-3 text-sm",
          isAssistant ? "bg-muted" : "bg-primary text-primary-foreground ml-auto",
        )}
      >
        <div className="mb-1">{formattedContent}</div>
        <div className="text-xs opacity-70 text-right mt-2">{format(new Date(message.timestamp), "h:mm a")}</div>
      </div>

      {!isAssistant && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-muted text-xs">YOU</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

