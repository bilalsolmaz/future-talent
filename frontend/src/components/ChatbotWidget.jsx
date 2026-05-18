import React, { useState, useEffect, useRef } from 'react';
import { getOrCreateSessionId } from '../utils/sessionUtils';

// SVG İkonları
const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18"></path><path d="m4.93 4.93 14.14 14.14"></path><path d="m19.07 4.93-14.14 14.14"></path><path d="M3 12h18"></path>
  </svg>
);

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Merhaba! Ben LocalShop Asistanı. Size nasıl yardımcı olabilirim? 👋' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Oturum ID'sini al
  const sessionId = getOrCreateSessionId();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Mesajı UI'a ekle
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Backend'e gönder (Base URL olarak localhost:8000 varsayıyoruz)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      
      const response = await fetch(`${apiUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mesaj: userMessage,
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('API Hatası');
      }

      const data = await response.json();
      
      // Gelen yanıtı ekle
      setMessages(prev => [...prev, { role: 'model', content: data.yanit }]);
    } catch (error) {
      console.error('Chat hatası:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: 'Üzgünüm, şu an sunucuya bağlanamıyorum. Lütfen daha sonra tekrar deneyin. 🔌' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Penceresi */}
      {isOpen && (
        <div className="mb-4 flex flex-col w-[350px] sm:w-[380px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-floating border border-surface-200 overflow-hidden transform transition-all animate-slide-up origin-bottom-right">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-md z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <SparkleIcon />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm">LocalShop Asistanı</h3>
                <p className="text-xs text-primary-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>
                  Çevrimiçi
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Kapat"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Mesaj Listesi */}
          <div className="flex-1 overflow-y-auto p-4 bg-surface-50 space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-subtle ${
                    msg.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-none' 
                      : 'bg-white text-surface-800 border border-surface-100 rounded-tl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-surface-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-subtle">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Alanı */}
          <form 
            onSubmit={handleSendMessage} 
            className="p-3 bg-white border-t border-surface-100 flex items-end gap-2"
          >
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Bir soru sorun..."
              className="flex-1 max-h-[120px] min-h-[44px] rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all scrollbar-hide"
              rows={1}
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim() || isLoading}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20 disabled:opacity-50 disabled:bg-surface-300 disabled:shadow-none transition-all flex-shrink-0"
              aria-label="Gönder"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full shadow-floating flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all animate-bounce-subtle group"
          aria-label="Sohbeti Aç"
        >
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></div>
          <div className="group-hover:rotate-12 transition-transform duration-300">
            <MessageIcon />
          </div>
        </button>
      )}

    </div>
  );
}
