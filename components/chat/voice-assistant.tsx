"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Send, Volume2, VolumeX, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat/chat-message"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Available Eleven Labs voices
const ELEVEN_LABS_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Bella (Female)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (Female)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Elli (Female)" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Adam (Male)" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh (Male)" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Sam (Male)" },
]

export function VoiceAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your Project Management Voice Assistant. I can help you track tasks, schedule meetings, and understand project management concepts. Try speaking to me or typing your question.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [useElevenLabs, setUseElevenLabs] = useState(true)
  const [selectedVoice, setSelectedVoice] = useState(ELEVEN_LABS_VOICES[0].id)
  const [voiceSpeed, setVoiceSpeed] = useState(1.0)
  const [audioReady, setAudioReady] = useState(false)
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const recognitionRef = useRef<any>(null)
  const hasInteractedRef = useRef(false)

  // Check if speech recognition is supported
  useEffect(() => {
    const checkSpeechSupport = () => {
      const supported =
        typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
      setSpeechSupported(supported)

      if (!supported) {
        console.log("Speech recognition not supported in this browser")
      }
    }

    checkSpeechSupport()
  }, [])

  // Track user interaction
  useEffect(() => {
    const handleInteraction = () => {
      hasInteractedRef.current = true
    }

    window.addEventListener("click", handleInteraction)
    window.addEventListener("keydown", handleInteraction)

    return () => {
      window.removeEventListener("click", handleInteraction)
      window.removeEventListener("keydown", handleInteraction)
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSpeaking()
      stopListening()

      // Clean up any object URLs
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl)
      }
    }
  }, [currentAudioUrl])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleListening = () => {
    if (!speechSupported) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition. Please type your message instead.",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const startListening = async () => {
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Stop any existing recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          console.log("Error aborting previous recognition:", e)
        }
      }

      // Only initialize SpeechRecognition when needed
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        // Auto-submit after voice input
        setTimeout(() => {
          handleSendMessage(transcript)
        }, 500)
      }

      recognition.onerror = (event) => {
        console.log("Speech recognition error:", event.error)

        if (event.error === "not-allowed") {
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access to use voice recognition.",
            variant: "destructive",
          })
        } else if (event.error !== "aborted") {
          // Don't show error for normal aborts
          toast({
            title: "Voice Recognition Error",
            description: "Please try again or type your message.",
            variant: "destructive",
          })
        }

        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
        recognitionRef.current = null
      }

      // Start recognition
      recognition.start()
      setIsListening(true)
    } catch (error) {
      console.error("Failed to start speech recognition:", error)
      setIsListening(false)
      toast({
        title: "Microphone Access Error",
        description: "Could not access microphone. Please check your browser permissions.",
        variant: "destructive",
      })
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {
        console.log("Error stopping recognition:", e)
      }
      recognitionRef.current = null
    }
    setIsListening(false)
  }

  const prepareAudio = async (text: string): Promise<string | null> => {
    if (useElevenLabs) {
      try {
        // Call Eleven Labs API
        const response = await fetch("/api/eleven-labs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            voiceId: selectedVoice,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate speech")
        }

        // Get audio blob
        const audioBlob = await response.blob()

        // Create object URL
        const audioUrl = URL.createObjectURL(audioBlob)

        // Clean up previous URL if exists
        if (currentAudioUrl) {
          URL.revokeObjectURL(currentAudioUrl)
        }

        setCurrentAudioUrl(audioUrl)
        return audioUrl
      } catch (error) {
        console.error("Error with Eleven Labs TTS:", error)
        toast({
          title: "Eleven Labs Error",
          description: "Could not generate audio with Eleven Labs.",
          variant: "destructive",
        })
        return null
      }
    }
    return null
  }

  const speakText = async (text: string) => {
    // Stop any current speech
    stopSpeaking()

    if (!hasInteractedRef.current) {
      toast({
        title: "User Interaction Required",
        description: "Please interact with the page first (click or press a key) to enable audio playback.",
        duration: 5000,
      })
      return
    }

    if (useElevenLabs) {
      const audioUrl = await prepareAudio(text)

      if (audioUrl) {
        try {
          setIsSpeaking(true)

          // Create a new audio element each time
          const audio = new Audio(audioUrl)
          audio.playbackRate = voiceSpeed

          audio.onended = () => {
            setIsSpeaking(false)
          }

          audio.onerror = (e) => {
            console.error("Audio playback error:", e)
            setIsSpeaking(false)
            toast({
              title: "Audio Playback Error",
              description: "Browser couldn't play the audio. Try using browser TTS instead.",
              variant: "destructive",
            })
          }

          // Store the reference
          audioRef.current = audio

          // Play with user interaction safety
          try {
            await audio.play()
          } catch (error) {
            console.error("Error playing audio:", error)
            setIsSpeaking(false)

            // Fallback to browser TTS
            speakWithBrowserTTS(text)
          }
        } catch (error) {
          console.error("Audio setup error:", error)
          setIsSpeaking(false)

          // Fallback to browser TTS
          speakWithBrowserTTS(text)
        }
      } else {
        // Fallback to browser TTS if Eleven Labs fails
        speakWithBrowserTTS(text)
      }
    } else {
      // Use browser's built-in TTS
      speakWithBrowserTTS(text)
    }
  }

  const speakWithBrowserTTS = (text: string) => {
    if ("speechSynthesis" in window) {
      try {
        // Stop any current speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = voiceSpeed
        utterance.pitch = 1.0
        utterance.volume = 1.0

        // Set event handlers
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => {
          setIsSpeaking(false)
          toast({
            title: "Speech Synthesis Error",
            description: "There was an error with the text-to-speech service.",
            variant: "destructive",
          })
        }

        // Get available voices and select a good one
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          const preferredVoice = voices.find(
            (voice) => voice.name.includes("Google") || voice.name.includes("Female") || voice.name.includes("en-US"),
          )

          if (preferredVoice) {
            utterance.voice = preferredVoice
          }
        } else {
          // If voices aren't loaded yet, wait for them
          window.speechSynthesis.onvoiceschanged = () => {
            const availableVoices = window.speechSynthesis.getVoices()
            const voice = availableVoices.find(
              (v) => v.name.includes("Google") || v.name.includes("Female") || v.name.includes("en-US"),
            )

            if (voice) {
              utterance.voice = voice
            }

            window.speechSynthesis.speak(utterance)
          }

          // Return early as we'll speak when voices are loaded
          return
        }

        // Speak the utterance
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error("Browser TTS error:", error)
        setIsSpeaking(false)
        toast({
          title: "Text-to-Speech Error",
          description: "Your browser encountered an error with speech synthesis.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Text-to-Speech Not Available",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive",
      })
    }
  }

  const stopSpeaking = () => {
    setIsSpeaking(false)

    // Stop audio element if it exists
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      } catch (e) {
        console.error("Error stopping audio:", e)
      }
    }

    // Stop browser TTS
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel()
      } catch (e) {
        console.error("Error canceling speech synthesis:", e)
      }
    }
  }

  async function handleSendMessage(overrideInput?: string) {
    const messageText = overrideInput || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      // In a real implementation, this would call the LLM API
      // For now, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Call the AI model API
      const response = await generateAssistantResponse(messageText)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Prepare audio but don't play automatically
      if (useElevenLabs) {
        const audioUrl = await prepareAudio(response)
        if (audioUrl) {
          setAudioReady(true)
          toast({
            title: "Response Ready",
            description: "Click the speak button to hear the response.",
            duration: 3000,
          })
        }
      } else {
        // For browser TTS, we can try to speak automatically
        speakText(response)
      }
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

  // This function would call the LLM API in a real implementation
  async function generateAssistantResponse(userInput: string): Promise<string> {
    const lowerInput = userInput.toLowerCase()

    // Task-related queries
    if (lowerInput.includes("tasks") && lowerInput.includes("due")) {
      return "You have 3 tasks due this week: 'Prepare Q1 Report' due on April 10, 'Update client presentation' due on April 7, and 'Review marketing materials' due on April 5. Would you like me to send reminders to the assignees?"
    }
    // Help with understanding project management
    else if (
      lowerInput.includes("help") &&
      lowerInput.includes("understand") &&
      lowerInput.includes("project management")
    ) {
      return "Project management involves planning, organizing, and overseeing projects to achieve specific goals within constraints like time and budget. In this app, you can create and track tasks, view project status, schedule meetings, and configure team members. What specific aspect of project management would you like to learn more about?"
    }
    // Explain specific PM concepts
    else if (lowerInput.includes("what") && lowerInput.includes("gantt chart")) {
      return "A Gantt chart is a visual project management tool that shows a project's tasks or activities displayed against time. It helps you see what tasks need to be completed, when each task begins and ends, how long each task will take, and where tasks overlap. Would you like me to explain other project management concepts?"
    } else if (lowerInput.includes("what") && lowerInput.includes("agile")) {
      return "Agile is a project management approach that breaks projects into small, manageable phases called 'sprints.' It emphasizes iterative development, team collaboration, customer feedback, and flexibility to change. Would you like me to explain how to set up an Agile workflow in this tool?"
    }
    // Explain app features
    else if (lowerInput.includes("what can you do") || lowerInput.includes("help me with")) {
      return "I can help you manage your project by tracking tasks and deadlines, sending reminders to team members, scheduling meetings, providing project status updates, and answering questions about project management concepts. What would you like help with today?"
    }
    // Reminder functionality
    else if (lowerInput.includes("remind") && lowerInput.match(/remind\s+(\w+)/)) {
      const person = lowerInput.match(/remind\s+(\w+)/)?.[1] || "someone"
      const taskMatch = lowerInput.match(/about\s+(.+?)(?:$|\s+by|\s+on)/)
      const task = taskMatch ? taskMatch[1] : "their tasks"
      return `I've sent a reminder to ${person.charAt(0).toUpperCase() + person.slice(1)} about ${task}. They'll receive an email notification shortly. Would you like me to follow up if they don't respond within 24 hours?`
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

        return `I've scheduled a meeting on ${date} at ${time} with ${attendees}. Calendar invites have been sent to all participants. Would you like me to prepare an agenda for this meeting?`
      } else {
        return "I'd be happy to schedule a meeting. Could you provide more details? When should it take place? Who should attend? What's the purpose of the meeting?"
      }
    }
    // Project status with more details
    else if (
      lowerInput.includes("project") &&
      (lowerInput.includes("status") || lowerInput.includes("progress") || lowerInput.includes("going"))
    ) {
      return "The project is progressing well. You have 12 tasks total with 5 completed, giving a 42% completion rate. You're currently on schedule with 3 tasks due in the next 3 days. There's 1 overdue task that needs attention. Your next milestone is the client presentation on April 15. Would you like me to send a detailed status report to the team?"
    }
    // Voice settings
    else if (lowerInput.includes("voice") && (lowerInput.includes("change") || lowerInput.includes("switch"))) {
      return "You can change my voice by clicking the settings icon in the top right corner of the chat. You can choose from different voices and adjust the speaking speed."
    }
    // Default response with suggestions
    else {
      return "I'm here to help with your project management needs. You can ask me about tasks and deadlines, scheduling meetings, sending reminders, project status updates, or project management concepts. For example, try asking 'What tasks are due?' or 'Help me understand Agile methodology'"
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
        <h1 className="text-2xl font-bold tracking-tight">Voice Project Assistant</h1>
        <p className="text-muted-foreground">Speak or type to interact with your AI project management assistant.</p>
      </div>

      <Card className="h-[calc(100vh-240px)] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Voice Assistant</span>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Voice Settings</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Voice Settings</h4>
                      <p className="text-sm text-muted-foreground">Configure the voice assistant settings.</p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="use-eleven-labs">Use Eleven Labs</Label>
                        <div className="col-span-2">
                          <Select
                            value={useElevenLabs ? "true" : "false"}
                            onValueChange={(value) => setUseElevenLabs(value === "true")}
                          >
                            <SelectTrigger id="use-eleven-labs">
                              <SelectValue placeholder="Select TTS engine" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Eleven Labs (Premium)</SelectItem>
                              <SelectItem value="false">Browser TTS (Basic)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {useElevenLabs && (
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="voice-select">Voice</Label>
                          <div className="col-span-2">
                            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                              <SelectTrigger id="voice-select">
                                <SelectValue placeholder="Select voice" />
                              </SelectTrigger>
                              <SelectContent>
                                {ELEVEN_LABS_VOICES.map((voice) => (
                                  <SelectItem key={voice.id} value={voice.id}>
                                    {voice.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="voice-speed">Speed</Label>
                        <div className="col-span-2 flex items-center gap-2">
                          <Slider
                            id="voice-speed"
                            min={0.5}
                            max={2}
                            step={0.1}
                            defaultValue={[1.0]}
                            value={[voiceSpeed]}
                            onValueChange={(value) => setVoiceSpeed(value[0])}
                          />
                          <span className="w-12 text-sm">{voiceSpeed.toFixed(1)}x</span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            hasInteractedRef.current = true
                            speakText("Hello, I'm your project management assistant. How can I help you today?")
                          }}
                          className="w-full"
                        >
                          Test Voice
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant={isSpeaking ? "destructive" : "outline"}
                size="sm"
                className="h-8 px-2"
                onClick={() => {
                  hasInteractedRef.current = true
                  if (isSpeaking) {
                    stopSpeaking()
                  } else if (currentAudioUrl) {
                    speakText(messages[messages.length - 1].content)
                  } else {
                    // If no audio is prepared, generate it
                    speakText(messages[messages.length - 1].content)
                  }
                }}
              >
                {isSpeaking ? <VolumeX className="h-4 w-4 mr-1" /> : <Volume2 className="h-4 w-4 mr-1" />}
                {isSpeaking ? "Stop" : "Speak"}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Ask questions or give commands using your voice or text</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                hasInteractedRef.current = true
                toggleListening()
              }}
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              className="flex-shrink-0"
              disabled={isProcessing || !speechSupported}
              title={!speechSupported ? "Speech recognition not supported in this browser" : ""}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Input
              placeholder={isListening ? "Listening..." : "Type or speak your message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing || isListening}
              className="flex-1"
            />
            <Button
              onClick={() => {
                hasInteractedRef.current = true
                handleSendMessage()
              }}
              disabled={!input.trim() || isProcessing || isListening}
              size="icon"
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Try asking:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  hasInteractedRef.current = true
                  handleSendMessage("What tasks are due this week?")
                }}
                className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full"
                disabled={isProcessing || isListening}
              >
                "What tasks are due this week?"
              </button>
              <button
                onClick={() => {
                  hasInteractedRef.current = true
                  handleSendMessage("Schedule a meeting with the team on Monday at 10am")
                }}
                className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full"
                disabled={isProcessing || isListening}
              >
                "Schedule a meeting with the team"
              </button>
              <button
                onClick={() => {
                  hasInteractedRef.current = true
                  handleSendMessage("Change my voice")
                }}
                className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full"
                disabled={isProcessing || isListening}
              >
                "Change my voice"
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

