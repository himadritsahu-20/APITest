import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import RequestEditor from './components/RequestEditor'
import ResponsePanel from './components/ResponsePanel'
import RoomControls from './components/RoomControls'

function App() {
  const [socket, setSocket] = useState(null)
  const [roomId, setRoomId] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [requests, setRequests] = useState([])
  const [memberCount, setMemberCount] = useState(0)
  const [activeRequestId, setActiveRequestId] = useState(null)

  const socketRef = useRef()

  useEffect(() => {
    const newSocket = io(process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:5000')
    socketRef.current = newSocket

    newSocket.on('connect', () => {
      console.log('✅ Connected to server')
      setIsConnected(true)
    })

    newSocket.on('room-joined', ({ roomId: joinedRoomId, requests: roomRequests }) => {
      setRoomId(joinedRoomId)
      setRequests(roomRequests)
    })

    newSocket.on('new-request', (request) => {
      setRequests(prev => [request, ...prev.slice(0, 9)])
    })

    newSocket.on('request-response', (response) => {
      setRequests(prev => prev.map(req => 
        req.id === response.id 
          ? { ...req, response }
          : req
      ))
    })

    newSocket.on('request-error', ({ id, error }) => {
      setRequests(prev => prev.map(req => 
        req.id === id 
          ? { ...req, error }
          : req
      ))
    })

    newSocket.on('member-joined', ({ memberCount }) => {
      setMemberCount(memberCount)
    })

    newSocket.on('member-left', ({ memberCount }) => {
      setMemberCount(memberCount)
    })

    setSocket(newSocket)

    return () => newSocket.close()
  }, [])

  const sendRequest = (requestData) => {
    if (socket && roomId) {
      socket.emit('send-request', { roomId, request: requestData })
    }
  }

  const joinRoom = (id) => {
    if (socket) {
      socket.emit('join-room', id)
    }
  }

  if (!roomId) {
    return <RoomControls joinRoom={joinRoom} />
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h1 className="text-xl font-bold">APIForge</h1>
          <div className="bg-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            Room: {roomId}
          </div>
          <div className="text-sm text-gray-400">
            {memberCount} {memberCount === 1 ? 'member' : 'members'} online
          </div>
        </div>
        <button
          onClick={() => {
            setRoomId('')
            setRequests([])
            setMemberCount(0)
          }}
          className="text-gray-400 hover:text-white"
        >
          ← New Room
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Requests History */}
        <div className="w-80 bg-gray-850 border-r border-gray-700 overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold mb-2">Recent Requests</h3>
            <div className="space-y-1">
              {requests.map((req) => (
                <button
                  key={req.id}
                  onClick={() => setActiveRequestId(req.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    activeRequestId === req.id
                      ? 'bg-blue-500/20 border border-blue-500'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="font-mono text-sm truncate">{req.method} {req.url}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {req.timestamp && new Date(req.timestamp).toLocaleTimeString()}
                  </div>
                  {req.response && (
                    <div className="text-xs bg-green-500/20 px-2 py-1 rounded mt-1">
                      {req.response.status}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <RequestEditor 
            onSend={sendRequest}
            activeRequest={requests.find(r => r.id === activeRequestId)}
          />
          <ResponsePanel 
            requests={requests}
            activeRequestId={activeRequestId}
          />
        </div>
      </div>
    </div>
  )
}

export default App