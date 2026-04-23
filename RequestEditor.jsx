import { useState, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const RequestEditor = ({ onSend, activeRequest }) => {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1')
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }])
  const [body, setBody] = useState('{}')

  useEffect(() => {
    if (activeRequest) {
      setMethod(activeRequest.method || 'GET')
      setUrl(activeRequest.url || '')
      setHeaders(activeRequest.headers || [])
      setBody(activeRequest.body || '{}')
    }
  }, [activeRequest])

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers]
    newHeaders[index] = { ...newHeaders[index], [field]: value }
    setHeaders(newHeaders)
  }

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const send = () => {
    const requestData = {
      method,
      url,
      headers: headers.reduce((acc, h) => {
        if (h.key && h.value) acc[h.key] = h.value
        return acc
      }, {}),
      body: method !== 'GET' && body ? JSON.parse(body) : undefined
    }
    onSend(requestData)
  }

  return (
    <div className="flex-1 border-b border-gray-700 p-6 overflow-y-auto">
      <div className="space-y-4">
        {/* URL Bar */}
        <div className="flex items-center space-x-2">
          <select 
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 font-mono text-sm w-24"
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>DELETE</option>
          </select>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-blue-500"
            placeholder="Enter request URL"
          />
          <button
            onClick={send}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Send
          </button>
        </div>

        {/* Headers */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-300">
            <ChevronDownIcon className="w-4 h-4" />
            Headers
          </div>
          {headers.map((header, index) => (
            <div key={index} className="flex space-x-2 items-end">
              <input
                value={header.key}
                onChange={(e) => updateHeader(index, 'key', e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none"
                placeholder="name"
              />
              <span className="text-gray-500">:</span>
              <input
                value={header.value}
                onChange={(e) => updateHeader(index, 'value', e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none"
                placeholder="value"
              />
              <button
                onClick={() => removeHeader(index)}
                className="text-gray-400 hover:text-red-400 p-1"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addHeader}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            + Add header
          </button>
        </div>

        {/* Body */}
        {method !== 'GET' && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-300">
              <ChevronDownIcon className="w-4 h-4" />
              Body
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-32 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-blue-500 resize-none"
              placeholder="{}"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default RequestEditor