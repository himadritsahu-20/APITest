import { useState } from 'react'
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline'

const ResponsePanel = ({ requests, activeRequestId }) => {
  const [selectedTab, setSelectedTab] = useState('response')

  const activeRequest = requests.find(r => r.id === activeRequestId)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const formatJson = (jsonString) => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2)
    } catch {
      return jsonString
    }
  }

  if (!activeRequest?.response && !activeRequest?.error) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
            <ClipboardDocumentIcon className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Response</h3>
          <p className="text-sm">Send a request to see the response here</p>
        </div>
      </div>
    )
  }

  const renderResponseTab = () => {
    if (!activeRequest.response) return null
    
    const { status, statusText, headers, body } = activeRequest.response
    
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Status</span>
            <div className={`px-3 py-1 rounded-full text-sm font-mono ${
              status >= 200 && status < 300
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : status >= 400
                ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
            }`}>
              {status} {statusText}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Headers */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-300">
            <ClipboardDocumentIcon className="w-4 h-4" />
            Response Headers ({Object.keys(headers).length})
          </div>
          <div className="max-h-40 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg p-4">
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} className="flex justify-between py-1 text-sm">
                <span className="text-gray-400 font-mono">{key}:</span>
                <span className="font-mono truncate ml-4">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Response Body</span>
            <button
              onClick={() => copyToClipboard(body)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Copy response"
            >
              <ClipboardDocumentIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <pre className="bg-gray-800 border border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
            {formatJson(body)}
          </pre>
        </div>
      </div>
    )
  }

  const renderErrorTab = () => {
    if (!activeRequest.error) return null
    
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-semibold text-red-400">Request Failed</h3>
          </div>
          <pre className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
            {activeRequest.error}
          </pre>
          <button
            onClick={() => copyToClipboard(activeRequest.error)}
            className="mt-4 flex items-center space-x-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
            <span>Copy error</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Tab Bar */}
      <div className="bg-gray-850 border-b border-gray-700 px-6 py-3">
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 max-w-max mx-auto">
          <button
            onClick={() => setSelectedTab('response')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedTab === 'response'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Response
          </button>
          {activeRequest.error && (
            <button
              onClick={() => setSelectedTab('error')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedTab === 'error'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Error
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {selectedTab === 'response' && renderResponseTab()}
        {selectedTab === 'error' && renderErrorTab()}
      </div>
    </div>
  )
}

export default ResponsePanel