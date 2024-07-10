import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    Prism.highlightAll();
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    setIsLoading(true);
    setError(null);
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          contents: [{ parts: [{ text: input }] }]
        },
        {
          params: {
            key: process.env.REACT_APP_GEMINI_API_KEY
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const botReply = response.data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { text: botReply, sender: 'bot' }]);
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (text) => {
    const codeRegex = /```python\n?([\s\S]*?)```/g;
    const parts = text.split(codeRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <pre key={index} className="bg-gray-800 p-4 rounded-md my-2 overflow-x-auto">
            <code className="language-python">{part}</code>
          </pre>
        );
      }
      return <p key={index} className="whitespace-pre-wrap">{part}</p>;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-4 shadow-md">
        <h1 className="text-3xl font-bold text-center flex items-center justify-center">
          <FaRobot className="mr-2" /> Gemini Chatbot
        </h1>
      </header>
      <main className="flex-grow p-4 overflow-auto bg-gray-50">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex max-w-xs md:max-w-2xl rounded-lg p-4 ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 shadow-md'
                }`}
              >
                {message.sender === 'user' ? (
                  <FaUser className="mr-2 mt-1 flex-shrink-0" />
                ) : (
                  <FaRobot className="mr-2 mt-1 flex-shrink-0" />
                )}
                <div>{formatMessage(message.text)}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {error && (
          <div className="text-red-500 text-center my-4 bg-red-100 border border-red-400 rounded p-2">
            {error}
          </div>
        )}
      </main>
      <footer className="bg-white border-t border-gray-200 p-4 shadow-inner">
        <div className="max-w-3xl mx-auto flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
            className="flex-grow mr-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            className={`bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md transition duration-300 flex items-center ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : <><FaPaperPlane className="mr-2" /> Send</>}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;