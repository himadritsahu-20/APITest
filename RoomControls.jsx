import { useState } from 'react'
import { io } from 'socket.io-client'

const RoomControls = ({ joinRoom }) => {
  const [roomId, setRoomId] = useState('')
  const [creating, setCreating] = useState(false)

  const createRoom = async () => {
    setCreating(true)
    try {
      const response = await fetch('/api/create-room', { method: 'POST' })
      const { roomId: newRoomId } = await response.json()
      setRoomId(newRoomId)
      joinRoom(newRoomId)
    } catch (error) {
      console.error('Failed to create room:', error)
    } finally {
      setCreating(false)
    }
  }

  const joinExistingRoom = () => {
    if (roomId.trim()) {
      joinRoom(roomId.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            APIForge
          </h1>
          <p className="text-gray-400 text-lg">Real-time collaborative API testing</p>
        </div>

        <div className="space-y-4">
          {/* Create Room */}
          <button
            onClick={createRoom}
            disabled={creating}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {creating ? 'Creating...' : '🎉 Create New Room'}
          </button>

          {/* OR Divider */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-500 text-sm font-medium">or</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          {/* Join Room */}
          <div className="flex space-x-3">
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID (e.g., abc12345)"
              className="flex-1 bg-gray-800/50 border border-gray-600/50 hover:border-gray-500 focus:border-blue-500 focus:outline-none rounded-xl px-5 py-4 text-lg placeholder-gray-500 backdrop-blur-sm transition-all duration-200"
            />
            <button
              onClick={joinExistingRoom}
              disabled={!roomId.trim()}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              Join Room
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-xs text-blue-300 text-center">
            👥 Multiple users can collaborate in real-time
          </p>
        </div>
      </div>
    </div>
  )
}

export default RoomControls