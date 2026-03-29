'use client'

import { useEffect, useRef } from 'react'
import { getSocket } from '@/lib/socket'

interface WhiteboardProps {
  spaceId: string
}

export function Whiteboard({ spaceId }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const socketRef = useRef<any>(null)
  const isDrawingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600
    ctx.strokeStyle = '#0ea5e9'
    ctx.lineWidth = 2

    const socket = getSocket('/spaces')
    socketRef.current = socket

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawingRef.current = true
      const point = getPoint(e)
      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return
      const point = getPoint(e)
      ctx.lineTo(point.x, point.y)
      ctx.stroke()

      // Send drawing data to server
      socket.emit('whiteboard-update', {
        spaceId,
        whiteboardData: {
          x: point.x,
          y: point.y,
          type: 'draw',
        },
      })
    }

    const stopDrawing = () => {
      isDrawingRef.current = false
    }

    const getPoint = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      if ('touches' in e) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        }
      }
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('touchstart', startDrawing)
    canvas.addEventListener('touchmove', draw)
    canvas.addEventListener('touchend', stopDrawing)

    socket.on('whiteboard-updated', (data: any) => {
      // Handle remote whiteboard updates
      if (data.whiteboardData.type === 'draw') {
        ctx.lineTo(data.whiteboardData.x, data.whiteboardData.y)
        ctx.stroke()
      }
    })

    return () => {
      canvas.removeEventListener('mousedown', startDrawing)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', stopDrawing)
      canvas.removeEventListener('touchstart', startDrawing)
      canvas.removeEventListener('touchmove', draw)
      canvas.removeEventListener('touchend', stopDrawing)
      socket.off('whiteboard-updated')
    }
  }, [spaceId])

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="bg-gray-900 w-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  )
}

