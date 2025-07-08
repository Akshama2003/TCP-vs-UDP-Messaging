"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Zap, Shield } from "lucide-react"

interface Message {
  id: string
  content: string
  timestamp: number
  protocol: "tcp" | "udp"
  status: "sent" | "delivered" | "failed" | "pending"
  sequenceNumber?: number
  acknowledged?: boolean
}

interface Stats {
  messagesSent: number
  messagesDelivered: number
  messagesLost: number
  averageLatency: number
  deliveryRate: number
}

export default function TCPUDPMessaging() {
  const [messages, setMessages] = useState<Message[]>([])
  const [tcpInput, setTcpInput] = useState("")
  const [udpInput, setUdpInput] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [tcpStats, setTcpStats] = useState<Stats>({
    messagesSent: 0,
    messagesDelivered: 0,
    messagesLost: 0,
    averageLatency: 0,
    deliveryRate: 100,
  })
  const [udpStats, setUdpStats] = useState<Stats>({
    messagesSent: 0,
    messagesDelivered: 0,
    messagesLost: 0,
    averageLatency: 0,
    deliveryRate: 85,
  })

  const wsRef = useRef<WebSocket | null>(null)
  const sequenceNumberRef = useRef(0)

  useEffect(() => {
    // Simulate WebSocket connection
    const connectWebSocket = () => {
      setIsConnected(true)

      // Simulate connection
      setTimeout(() => {
        console.log("WebSocket connected (simulated)")
      }, 1000)
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const sendTCPMessage = () => {
    if (!tcpInput.trim()) return

    const messageId = Date.now().toString()
    const message: Message = {
      id: messageId,
      content: tcpInput,
      timestamp: Date.now(),
      protocol: "tcp",
      status: "pending",
      sequenceNumber: ++sequenceNumberRef.current,
      acknowledged: false,
    }

    setMessages((prev) => [...prev, message])
    setTcpInput("")

    // Simulate TCP behavior - reliable delivery with acknowledgment
    setTimeout(
      () => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, status: "delivered", acknowledged: true } : msg)),
        )

        setTcpStats((prev) => ({
          ...prev,
          messagesSent: prev.messagesSent + 1,
          messagesDelivered: prev.messagesDelivered + 1,
          averageLatency: Math.random() * 50 + 20, // 20-70ms
          deliveryRate: 100,
        }))
      },
      Math.random() * 100 + 50,
    ) // 50-150ms delay
  }

  const sendUDPMessage = () => {
    if (!udpInput.trim()) return

    const messageId = Date.now().toString()
    const message: Message = {
      id: messageId,
      content: udpInput,
      timestamp: Date.now(),
      protocol: "udp",
      status: "sent",
    }

    setMessages((prev) => [...prev, message])
    setUdpInput("")

    // Simulate UDP behavior - fast but potentially unreliable
    const deliverySuccess = Math.random() > 0.15 // 85% success rate
    const delay = Math.random() * 30 + 5 // 5-35ms delay (faster than TCP)

    setTimeout(() => {
      if (deliverySuccess) {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status: "delivered" } : msg)))
        setUdpStats((prev) => ({
          ...prev,
          messagesSent: prev.messagesSent + 1,
          messagesDelivered: prev.messagesDelivered + 1,
          averageLatency: Math.random() * 30 + 5,
          deliveryRate: Math.round(((prev.messagesDelivered + 1) / (prev.messagesSent + 1)) * 100),
        }))
      } else {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status: "failed" } : msg)))
        setUdpStats((prev) => ({
          ...prev,
          messagesSent: prev.messagesSent + 1,
          messagesLost: prev.messagesLost + 1,
          deliveryRate: Math.round((prev.messagesDelivered / (prev.messagesSent + 1)) * 100),
        }))
      }
    }, delay)
  }

  const clearMessages = () => {
    setMessages([])
    setTcpStats({
      messagesSent: 0,
      messagesDelivered: 0,
      messagesLost: 0,
      averageLatency: 0,
      deliveryRate: 100,
    })
    setUdpStats({
      messagesSent: 0,
      messagesDelivered: 0,
      messagesLost: 0,
      averageLatency: 0,
      deliveryRate: 85,
    })
    sequenceNumberRef.current = 0
  }

  const getStatusIcon = (message: Message) => {
    switch (message.status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const tcpMessages = messages.filter((m) => m.protocol === "tcp")
  const udpMessages = messages.filter((m) => m.protocol === "udp")

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">TCP vs UDP Messaging Demo</h1>
        <p className="text-muted-foreground">
          Experience the differences between TCP and UDP protocols in real-time messaging
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant={isConnected ? "default" : "secondary"}>{isConnected ? "Connected" : "Disconnected"}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* TCP Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              TCP - Reliable Protocol
            </CardTitle>
            <div className="text-sm text-muted-foreground">Guaranteed delivery, ordered, connection-oriented</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  Messages Sent: <span className="font-mono">{tcpStats.messagesSent}</span>
                </div>
                <div>
                  Delivered: <span className="font-mono">{tcpStats.messagesDelivered}</span>
                </div>
                <div>
                  Avg Latency: <span className="font-mono">{tcpStats.averageLatency.toFixed(1)}ms</span>
                </div>
                <div>
                  Delivery Rate: <span className="font-mono">{tcpStats.deliveryRate}%</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tcpMessages.map((message) => (
                  <div key={message.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    {getStatusIcon(message)}
                    <span className="text-sm font-mono">#{message.sequenceNumber}</span>
                    <span className="flex-1 text-sm">{message.content}</span>
                    {message.acknowledged && (
                      <Badge variant="outline" className="text-xs">
                        ACK
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={tcpInput}
                  onChange={(e) => setTcpInput(e.target.value)}
                  placeholder="Type TCP message..."
                  onKeyPress={(e) => e.key === "Enter" && sendTCPMessage()}
                />
                <Button onClick={sendTCPMessage} disabled={!isConnected}>
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UDP Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              UDP - Fast Protocol
            </CardTitle>
            <div className="text-sm text-muted-foreground">Fast delivery, no guarantees, connectionless</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  Messages Sent: <span className="font-mono">{udpStats.messagesSent}</span>
                </div>
                <div>
                  Delivered: <span className="font-mono">{udpStats.messagesDelivered}</span>
                </div>
                <div>
                  Lost: <span className="font-mono text-red-500">{udpStats.messagesLost}</span>
                </div>
                <div>
                  Delivery Rate: <span className="font-mono">{udpStats.deliveryRate}%</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {udpMessages.map((message) => (
                  <div key={message.id} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                    {getStatusIcon(message)}
                    <span className="flex-1 text-sm">{message.content}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.random() * 30 + 5 < 20 ? "Fast" : "Normal"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={udpInput}
                  onChange={(e) => setUdpInput(e.target.value)}
                  placeholder="Type UDP message..."
                  onKeyPress={(e) => e.key === "Enter" && sendUDPMessage()}
                />
                <Button onClick={sendUDPMessage} disabled={!isConnected}>
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Protocol Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Protocol Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="characteristics">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="characteristics">Characteristics</TabsTrigger>
              <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
            </TabsList>

            <TabsContent value="characteristics" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-blue-600 mb-3">TCP (Transmission Control Protocol)</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Reliable delivery guaranteed
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Messages arrive in order
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Error detection and correction
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Flow control and congestion control
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Higher latency due to overhead
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-orange-600 mb-3">UDP (User Datagram Protocol)</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Fast transmission
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Low latency
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Minimal overhead
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      No delivery guarantee
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Messages may arrive out of order
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="use-cases" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-blue-600 mb-3">TCP Use Cases</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Web browsing (HTTP/HTTPS)</li>
                    <li>• Email (SMTP, POP3, IMAP)</li>
                    <li>• File transfers (FTP)</li>
                    <li>• Remote access (SSH, Telnet)</li>
                    <li>• Database connections</li>
                    <li>• Chat applications</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-orange-600 mb-3">UDP Use Cases</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Online gaming</li>
                    <li>• Video streaming</li>
                    <li>• Voice over IP (VoIP)</li>
                    <li>• DNS lookups</li>
                    <li>• Live broadcasts</li>
                    <li>• IoT sensor data</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-6">
        <Button onClick={clearMessages} variant="outline">
          Clear All Messages
        </Button>
      </div>
    </div>
  )
}
