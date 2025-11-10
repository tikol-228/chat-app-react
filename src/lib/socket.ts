import { io, Socket } from 'socket.io-client'

type IncomingMessage = any

let socket: Socket | null = null

export function initSocket(onUserId: (id: number) => void, onMessage: (payload: IncomingMessage) => void) {
  if (socket) return socket

  // connect to local mock server
  socket = io('http://localhost:8081', {
    transports: ['websocket', 'polling'],
  })

  socket.on('connect', () => {
    console.log('[socket] connected', socket?.id)
  })

  socket.on('userId', (id: number) => {
    console.log('[socket] userId', id)
    onUserId(id)
  })

  socket.on('message', (payload: any) => {
    console.log('[socket] message', payload)
    onMessage(payload)
  })

  socket.on('disconnect', (reason) => {
    console.log('[socket] disconnect', reason)
  })

  return socket
}

export function sendSocketMessage(payload: any) {
  if (!socket) return
  socket.emit('message', payload)
}
