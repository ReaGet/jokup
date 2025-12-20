'use client'

import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

export function useSocket() {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socketInstance

    socketInstance.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setConnected(false)
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      socketInstance.close()
    }
  }, [])

  return { socket, connected }
}
