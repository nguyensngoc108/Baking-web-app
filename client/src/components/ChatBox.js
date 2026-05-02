import React, { useState, useRef, useEffect } from 'react';
import api from '../services/httpServices';
import '../styles/ChatBox.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your bakery assistant. How can I help you today? Ask me about our cakes, allergies, or recommendations!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message to chatbot
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send to backend
      const response = await api.post('/chat', {
        message: inputMessage
      });

      // Add bot response
      const botMessage = {
        id: messages.length + 2,
        text: response.data.botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        id: messages.length + 2,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbox-container">
      {/* Chat Toggle Button */}
      <button 
        className="chatbox-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with our bakery assistant"
      >
        <span>💬</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbox-window">
          {/* Header */}
          <div className="chatbox-header">
            <h3>🍰 Bakery Assistant</h3>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chatbox-messages">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`message ${msg.sender}`}
              >
                <div className="message-content">
                  {msg.text}
                </div>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            ))}
            
            {isLoading && (
              <div className="message bot">
                <div className="message-content loading">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form className="chatbox-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Ask about cakes, allergies, recommendations..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="chatbox-input"
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="send-btn"
            >
              {isLoading ? '...' : '→'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
