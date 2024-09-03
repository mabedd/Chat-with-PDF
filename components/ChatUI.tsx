'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const ChatMessage = ({ text, isUser }: { text: string; isUser: boolean }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-xs rounded-lg p-3 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
        }`}
      >
        {text}
      </div>
    </div>
  )
}

const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <button
      className='p-2 rounded bg-gray-700 text-white dark:bg-gray-200 dark:text-black'
      onClick={toggleTheme}
    >
      Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
    </button>
  )
}

const ChatUI = () => {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
    []
  )
  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [fileName, setFileName] = useState<string | null>(null)

  // Add a welcome message when the component first mounts
  useEffect(() => {
    setMessages([
      {
        text: 'Welcome to the chatbot! Please upload a file to get started.',
        isUser: false,
      },
    ])
  }, [])

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = { text: input, isUser: true }
      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setLoading(true)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: input }),
        })

        const data = await response.json()
        const botMessage = { text: data.answer, isUser: false }
        setMessages((prev) => [...prev, botMessage])
      } catch (error) {
        console.error('Error sending message:', error)
        setMessages((prev) => [
          ...prev,
          { text: 'Error: Unable to get response.', isUser: false },
        ])
      } finally {
        setLoading(false)
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setMessages((prev) => [
        ...prev,
        {
          text: `You have uploaded the file "${file.name}". How can I help?`,
          isUser: false,
        },
      ])
      console.log('File uploaded:', file.name)
    }
  }

  return (
    <div className='flex flex-col h-screen bg-gray-100 dark:bg-gray-900'>
      <header className='flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md'>
        <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
          Chatbot
        </h1>
      </header>
      <main className='flex-1 overflow-y-auto p-4'>
        {messages.map((msg, index) => (
          <ChatMessage key={index} text={msg.text} isUser={msg.isUser} />
        ))}
        {loading && (
          <div className='text-center text-gray-500 dark:text-gray-400'>
            Typing...
          </div>
        )}
      </main>
      <footer className='p-4 bg-white dark:bg-gray-800'>
        <div className='flex items-center space-x-2'>
          <label
            htmlFor='file-upload'
            className='bg-blue-500 text-white p-2 rounded cursor-pointer dark:bg-blue-600'
          >
            Upload
          </label>
          <input
            id='file-upload'
            type='file'
            className='hidden'
            accept='.pdf'
            onChange={handleFileUpload}
          />
          <Input
            className='flex-1'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type your message...'
            disabled={!fileName}
          />
          <Button
            className='bg-blue-500 text-white dark:bg-blue-600'
            onClick={handleSendMessage}
            disabled={loading || !fileName}
          >
            Send
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default ChatUI
