'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Search, Users, Clock } from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

interface SupportTicket {
  id: string
  subject: string
  status: 'open' | 'pending' | 'resolved' | 'closed'
  createdAt: Date
  lastUpdated: Date
  messages: Array<{
    id: string
    sender: 'user' | 'support'
    content: string
    timestamp: Date
  }>
}

interface ChatMessage {
  id: string
  type: 'user' | 'bot' | 'system'
  content: string
  timestamp: Date
  suggestedActions?: string[]
}

const mockFAQs: FAQ[] = [
  {
    id: '1',
    question: 'How do I connect my wallet?',
    answer: 'To connect your wallet, click the "Connect Wallet" button in the top right corner of the navigation bar. Select your preferred wallet provider (MetaMask, WalletConnect, etc.) and follow the prompts to authorize the connection.',
    category: 'Wallet',
    tags: ['wallet', 'connect', 'setup']
  },
  {
    id: '2',
    question: 'What is the minimum voting power?',
    answer: 'The minimum voting power required to participate in governance proposals is 100 GOV tokens. However, certain proposals may have higher requirements specified in their details.',
    category: 'Governance',
    tags: ['voting', 'governance', 'tokens']
  },
  {
    id: '3',
    question: 'How are gas fees calculated?',
    answer: 'Gas fees are calculated based on network congestion and transaction complexity. The system displays an estimated gas fee before you confirm any transaction. You can adjust the gas price to prioritize faster confirmation.',
    category: 'Transactions',
    tags: ['gas', 'fees', 'transactions']
  },
  {
    id: '4',
    question: 'What is Snapshot voting?',
    answer: 'Snapshot voting allows you to participate in governance proposals without paying gas fees. Votes are signed off-chain and aggregated on the Snapshot platform, making it cost-effective for community participation.',
    category: 'Governance',
    tags: ['snapshot', 'voting', 'off-chain']
  },
  {
    id: '5',
    question: 'How do I create a proposal?',
    answer: 'To create a proposal, navigate to the Proposals page and click "Create Proposal". You\'ll need to provide a title, description, category, and voting period. Make sure you have sufficient voting power to submit proposals.',
    category: 'Governance',
    tags: ['proposal', 'create', 'governance']
  }
]

const mockTickets: SupportTicket[] = [
  {
    id: '1',
    subject: 'Issue with wallet connection',
    status: 'resolved',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    messages: [
      {
        id: '1',
        sender: 'user',
        content: 'I\'m having trouble connecting my MetaMask wallet',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        sender: 'support',
        content: 'Please try clearing your browser cache and ensuring MetaMask is updated to the latest version.',
        timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000)
      }
    ]
  }
]

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showFAQs, setShowFAQs] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketSubject, setTicketSubject] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    // Add welcome message when chat opens
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'bot',
        content: 'Hello! I\'m your CurrentDao support assistant. How can I help you today? You can ask me questions or browse our FAQ below.',
        timestamp: new Date(),
        suggestedActions: ['Browse FAQ', 'Create Support Ticket', 'Check Ticket Status']
      }])
    }
  }, [isOpen, messages.length])

  const filteredFAQs = mockFAQs.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(content)
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateBotResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase()
    
    // Check for FAQ matches
    const matchedFAQ = mockFAQs.find(faq => 
      faq.question.toLowerCase().includes(input) ||
      faq.tags.some(tag => tag.toLowerCase().includes(input))
    )

    if (matchedFAQ) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: matchedFAQ.answer,
        timestamp: new Date(),
        suggestedActions: ['Was this helpful?', 'More questions like this', 'Create ticket']
      }
    }

    // Default responses
    if (input.includes('wallet') || input.includes('connect')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: 'For wallet connection issues, please ensure your wallet is updated and you\'re using a supported browser. You can find detailed instructions in our FAQ section.',
        timestamp: new Date(),
        suggestedActions: ['View Wallet FAQ', 'Create Support Ticket']
      }
    }

    if (input.includes('vote') || input.includes('governance')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: 'For voting and governance questions, you need to hold GOV tokens and have your wallet connected. Check the Governance page for active proposals.',
        timestamp: new Date(),
        suggestedActions: ['View Governance FAQ', 'Go to Proposals']
      }
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: 'I\'m not sure about that specific question. Let me connect you with our FAQ or you can create a support ticket for personalized assistance.',
      timestamp: new Date(),
      suggestedActions: ['Browse FAQ', 'Create Support Ticket']
    }
  }

  const handleFAQClick = (faq: FAQ) => {
    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content: faq.answer,
      timestamp: new Date(),
      suggestedActions: ['Was this helpful?', 'More questions like this']
    }

    const userMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'user',
      content: faq.question,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, botMessage])
    setShowFAQs(false)
  }

  const handleCreateTicket = () => {
    if (!ticketSubject.trim()) return

    const newTicket: SupportTicket = {
      id: Date.now().toString(),
      subject: ticketSubject,
      status: 'open',
      createdAt: new Date(),
      lastUpdated: new Date(),
      messages: [{
        id: '1',
        sender: 'user',
        content: ticketSubject,
        timestamp: new Date()
      }]
    }

    setTickets(prev => [newTicket, ...prev])
    setTicketSubject('')
    setShowTicketForm(false)

    const confirmationMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: `Support ticket #${newTicket.id} created successfully. Our team will respond within 24 hours.`,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, confirmationMessage])
  }

  const categories = ['all', ...Array.from(new Set(mockFAQs.map(faq => faq.category)))]

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-orange-600 bg-orange-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      case 'closed': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <div className="w-6 h-6">💬</div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-96 h-[600px] flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5">🤖</div>
              <h3 className="font-semibold">Support Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : message.type === 'system'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="flex items-start gap-2">
                        {message.type === 'bot' && <div className="w-4 h-4 mt-0.5">🤖</div>}
                        {message.type === 'user' && <div className="w-4 h-4 mt-0.5">👤</div>}
                        <div>
                          <p className="text-sm">{message.content}</p>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Suggested Actions */}
                    {message.suggestedActions && (
                      <div className="mt-2 space-y-1">
                        {message.suggestedActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              if (action.includes('FAQ')) {
                                setShowFAQs(true)
                              } else if (action.includes('ticket')) {
                                setShowTicketForm(true)
                              } else if (action.includes('helpful')) {
                                handleSendMessage('Thank you, that was helpful!')
                              } else {
                                handleSendMessage(action)
                              }
                            }}
                            className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4">🤖</div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* FAQ Section */}
            {showFAQs && (
              <div className="border-t p-4">
                <div className="mb-3">
                  <h4 className="font-semibold mb-2">Frequently Asked Questions</h4>
                  
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search FAQs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm mb-3"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredFAQs.map(faq => (
                    <button
                      key={faq.id}
                      onClick={() => handleFAQClick(faq)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-sm">{faq.question}</div>
                      <div className="text-xs text-gray-600">{faq.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket Creation Form */}
            {showTicketForm && (
              <div className="border-t p-4">
                <h4 className="font-semibold mb-3">Create Support Ticket</h4>
                <input
                  type="text"
                  placeholder="Describe your issue..."
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm mb-3"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTicket()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTicket}
                    disabled={!ticketSubject.trim()}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    Submit Ticket
                  </button>
                  <button
                    onClick={() => setShowTicketForm(false)}
                    className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="border-t p-3 flex gap-2">
              <button
                onClick={() => setShowFAQs(!showFAQs)}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                {showFAQs ? 'Hide FAQ' : 'Show FAQ'}
              </button>
              <button
                onClick={() => setShowTicketForm(true)}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                New Ticket
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                className="flex-1 px-3 py-2 border rounded-lg"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isTyping}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <div className="w-4 h-4">➤</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
