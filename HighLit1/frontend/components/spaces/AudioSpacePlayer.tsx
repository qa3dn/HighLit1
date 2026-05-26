'use client'

import { useEffect, useState, useRef } from 'react'
import { getSocket } from '@/lib/socket'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface AudioSpacePlayerProps {
  spaceId: string
  userId: string
}

export function AudioSpacePlayer({ spaceId, userId }: AudioSpacePlayerProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const socketRef = useRef<any>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const socket = getSocket('/spaces')
    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('join-space', { spaceId, userId })
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('user-joined', (data: any) => {
      console.log('User joined:', data)
    })

    socket.on('user-left', (data: any) => {
      console.log('User left:', data)
    })

    return () => {
      socket.disconnect()
    }
  }, [spaceId, userId])

  const handleStartSpeaking = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      setIsSpeaking(true)
      // In a real implementation, you would send audio data through socket
    } catch (error) {
      console.error('Failed to access microphone:', error)
    }
  }

  const handleStopSpeaking = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    setIsSpeaking(false)
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">الجلسة الصوتية</h3>
          <p className="text-sm text-gray-400">
            {isConnected ? 'متصل' : 'غير متصل'}
          </p>
        </div>
        {!isSpeaking ? (
          <Button onClick={handleStartSpeaking} variant="primary">
            ابدأ الكلام
          </Button>
        ) : (
          <Button onClick={handleStopSpeaking} variant="secondary">
            توقف عن الكلام
          </Button>
        )}
      </div>
    </Card>
  )
}

