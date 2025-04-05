"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Send, Volume2, VolumeX, Loader2, Settings } from "lucide-react"
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

export function AIPoweredAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI-powered Project Management Assistant. I can help you track tasks, schedule meetings, and understand project management concepts. Try speaking to me or typing your question.",
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
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Initialize audio element
  useEffect(() => {
    // Only initialize audio after the component is mounted
    if (typeof window !== "undefined") {
      // Create audio context only after user interaction
      const initializeAudio = () => {
        if (!audioRef.current) {
          audioRef.current = new Audio()
          audioRef.current.onplay = () => setIsSpeaking(true)
          audioRef.current.onended = () => setIsSpeaking(false)
          audioRef.current.onerror = (e) => {
            console.error("Audio error:", e)
            setIsSpeaking(false)
            toast({
              title: "Audio Playback Error",
              description: "There was an error playing the audio. Please try again.",
              variant: "destructive",
            })
          }
        }
      }

      // Initialize on first user interaction
      const handleUserInteraction = () => {
        initializeAudio()
        // Remove event listeners after initialization
        document.removeEventListener("click", handleUserInteraction)
        document.removeEventListener("keydown", handleUserInteraction)
      }

      document.addEventListener("click", handleUserInteraction)
      document.addEventListener("keydown", handleUserInteraction)

      return () => {
        document.removeEventListener("click", handleUserInteraction)
        document.removeEventListener("keydown", handleUserInteraction)
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = ""
        }
      }
    }
  }, [toast])

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

      // Only initialize SpeechRecognition when needed
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

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
    // We don't need to explicitly stop recognition
    // It will automatically stop and trigger onend
    setIsListening(false)
  }

  const speakText = async (text: string) => {
    // Stop any current speech
    stopSpeaking()

    if (useElevenLabs) {
      try {
        setIsSpeaking(true)

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

        // Create object URL and play audio
        const audioUrl = URL.createObjectURL(audioBlob)

        if (audioRef.current) {
          // Make sure audio element is properly initialized
          if (!audioRef.current.paused) {
            audioRef.current.pause()
          }

          audioRef.current.src = audioUrl
          audioRef.current.playbackRate = voiceSpeed

          // Play with user interaction safety
          const playAudio = async () => {
            try {
              // Use the play() promise to catch errors
              await audioRef.current?.play()
            } catch (error) {
              console.error("Error playing audio:", error)
              setIsSpeaking(false)

              // If autoplay is prevented, show a play button
              toast({
                title: "Audio Ready",
                description: "Click the speak button to play the response.",
                duration: 3000,
              })
            }
          }

          playAudio()
        } else {
          // Fallback if audio element isn't ready
          toast({
            title: "Audio Ready",
            description: "Click the speak button to hear the response.",
            duration: 3000,
          })
          setIsSpeaking(false)
        }
      } catch (error) {
        console.error("Error with Eleven Labs TTS:", error)
        setIsSpeaking(false)

        // Fall back to browser TTS
        toast({
          title: "Eleven Labs Error",
          description: "Falling back to browser text-to-speech.",
          variant: "destructive",
        })

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

        // Get available voices and select a good one
        let voices = window.speechSynthesis.getVoices()

        // If voices array is empty, wait for voices to load
        if (voices.length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices()
            const preferredVoice = voices.find(
              (voice) => voice.name.includes("Google") || voice.name.includes("Female") || voice.name.includes("en-US"),
            )

            if (preferredVoice) {
              utterance.voice = preferredVoice
            }

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

            setIsSpeaking(true)
            window.speechSynthesis.speak(utterance)
          }
        } else {
          const preferredVoice = voices.find(
            (voice) => voice.name.includes("Google") || voice.name.includes("Female") || voice.name.includes("en-US"),
          )

          if (preferredVoice) {
            utterance.voice = preferredVoice
          }

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

          setIsSpeaking(true)
          window.speechSynthesis.speak(utterance)
        }
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
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }

    setIsSpeaking(false)
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
      // Call the actual LLM API
      const response = await callLLMApi(messageText)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Automatically speak the response
      speakText(response)
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

  // Function to call the LLM API
  async function callLLMApi(message: string): Promise<string> {
    try {
      const response = await fetch("/api/ai-integration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error("Error calling LLM API:", error)
      return "I'm sorry, I couldn't connect to my AI service. Please try again later."
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
        <h1 className="text-2xl font-bold tracking-tight">AI Voice Assistant</h1>
        <p className="text-muted-foreground">
          Speak or type to interact with your AI-powered project management assistant.
        </p>
      </div>

      <Card className="h-[calc(100vh-240px)] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AI Assistant</span>
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
                            if (!audioRef.current) {
                              // Initialize audio if not already done
                              audioRef.current = new Audio()
                              audioRef.current.onplay = () => setIsSpeaking(true)
                              audioRef.current.onended = () => setIsSpeaking(false)
                              audioRef.current.onerror = () => setIsSpeaking(false)
                            }
                            speakText(
                              "Hello, I'm your AI-powered project management assistant. How can I help you today?",
                            )
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
                onClick={isSpeaking ? stopSpeaking : () => speakText(messages[messages.length - 1].content)}
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
              onClick={toggleListening}
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
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isProcessing || isListening}
              size="icon"
              className="flex-shrink-0"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Try asking:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSendMessage("What tasks are due this week?")}
                className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full"
                disabled={isProcessing || isListening}
              >
                "What tasks are due this week?"
              </button>
              <button
                onClick={() => handleSendMessage("Schedule a meeting with the team on Monday at 10am")}
                className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full"
                disabled={isProcessing || isListening}
              >
                "Schedule a meeting with the team"
              </button>
              <button
                onClick={() => handleSendMessage("Change my voice")}
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

