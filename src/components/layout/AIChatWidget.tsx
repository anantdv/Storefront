import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, HelpCircle, Award, Sparkles, Move } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Hello! I am Tinni, your storefront assistant. How can I help you with shopping, loyalty points, or hire purchase today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Position coordinates for the floating button
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);

  // Expose a global method to open the Tinni chat window programmatically
  useEffect(() => {
    (window as any).openTinniChat = () => {
      setIsOpen(true);
    };
    return () => {
      delete (window as any).openTinniChat;
    };
  }, []);

  // Set default initial position on mount (bottom-right)
  useEffect(() => {
    setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  }, []);

  // Handle window resizing to keep the button inside boundary limits
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 80),
        y: Math.min(prev.y, window.innerHeight - 80)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Drag Events
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsDragging(true);
    didDrag.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { x: position.x, y: position.y };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        didDrag.current = true;
      }

      const newX = Math.max(10, Math.min(window.innerWidth - 65, elementStartPos.current.x + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 65, elementStartPos.current.y + deltaY));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Touch Drag Events
  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    setIsDragging(true);
    didDrag.current = false;
    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    elementStartPos.current = { x: position.x, y: position.y };
  };

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      if (!touch) return;
      
      const deltaX = touch.clientX - dragStartPos.current.x;
      const deltaY = touch.clientY - dragStartPos.current.y;
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        didDrag.current = true;
      }

      const newX = Math.max(10, Math.min(window.innerWidth - 65, elementStartPos.current.x + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 65, elementStartPos.current.y + deltaY));
      
      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const handleButtonClick = () => {
    if (!didDrag.current) {
      setIsOpen(!isOpen);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response connection to Antigravity SDK
    setTimeout(() => {
      let aiResponseText = "Hi! I am Tinni. I've processed your query. Let me know how else I can help you.";
      const inputLower = userMsg.text.toLowerCase();

      if (inputLower.includes('loyalty') || inputLower.includes('point') || inputLower.includes('rewards')) {
        aiResponseText = "Your loyalty account is synced with ERPNext. You earn points on purchase which you can see in the Profile tab on your Account page.";
      } else if (inputLower.includes('hire') || inputLower.includes('purchase') || inputLower.includes('installment')) {
        aiResponseText = "Check out our Hire Purchase page from the top navigation to compute monthly interest installments using our custom rate calculator.";
      } else if (inputLower.includes('help') || inputLower.includes('support') || inputLower.includes('contact') || inputLower.includes('real')) {
        aiResponseText = "Need support? Contact us at enquiry@courts.com.pg or phone +(675) 7411 4180. You can also request a callback from a real representative.";
      } else if (inputLower.includes('locator') || inputLower.includes('store') || inputLower.includes('warehouse')) {
        aiResponseText = "Click on 'Store Locator' in the top bar to view POM and Lae warehouse locations and operating schedules.";
      }

      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Draggable Floating Action Button */}
      <button
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleButtonClick}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 50,
        }}
        className={`flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-[#f11d2b] to-[#1357d9] text-white shadow-xl transition-transform select-none hover:scale-105 cursor-grab active:cursor-grabbing ${
          isDragging ? 'scale-105' : ''
        }`}
        title="AI Assistant Tinni - Drag to Reposition"
      >
        <Bot className="h-6 w-6 animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ffcb2f] opacity-75"></span>
          <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#ffcb2f] text-[8px] font-black text-[#0b0d10]">AI</span>
        </span>
        
        {/* Tiny drag indicator handle on hover */}
        <span className="absolute -bottom-2 flex items-center gap-0.5 rounded bg-slate-900/80 px-1 py-0.5 text-[8px] font-bold text-white opacity-0 transition-opacity hover:opacity-100 pointer-events-none">
          <Move className="h-2 w-2" /> DRAG
        </span>
      </button>

      {/* Glassmorphic Chat Box Pane */}
      {isOpen && (
        <div 
          className="fixed z-50 flex h-[480px] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0d10]/96 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-200 sm:w-[380px]"
          style={{
            bottom: '85px',
            right: '16px',
            left: '16px',
            maxWidth: '380px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#f11d2b] to-[#1357d9] p-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/10 p-1.5 rounded-xl">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wide">Tinni AI Assistant</h3>
                <span className="flex items-center gap-1 text-[10px] font-bold text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                  Active SDK Link
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-white transition-colors hover:bg-white/10"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Quick shortcuts */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-white/10 bg-white/5 p-2.5 scrollbar-none">
            <button 
              onClick={() => setInputText('How to earn loyalty points?')}
              className="shrink-0 rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[10px] font-bold text-white/70 transition-colors hover:border-[#ffcb2f] hover:text-[#ffcb2f]"
            >
              <Award className="mr-1 inline h-3.5 w-3.5 text-[#ffcb2f]" /> Loyalty Program
            </button>
            <button 
              onClick={() => setInputText('How does Hire Purchase work?')}
              className="shrink-0 rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[10px] font-bold text-white/70 transition-colors hover:border-[#ffcb2f] hover:text-[#ffcb2f]"
            >
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-[#ffcb2f]" /> Hire Purchase
            </button>
            <button 
              onClick={() => setInputText('What is courts customer support phone number?')}
              className="shrink-0 rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[10px] font-bold text-white/70 transition-colors hover:border-[#ffcb2f] hover:text-[#ffcb2f]"
            >
              <HelpCircle className="mr-1 inline h-3.5 w-3.5 text-[#ffcb2f]" /> Get Support
            </button>
          </div>

          {/* Messages stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-medium ${
                    msg.sender === 'user'
                      ? 'rounded-br-none bg-gradient-to-r from-[#1357d9] to-[#f11d2b] text-white shadow-xxs'
                      : 'rounded-bl-none bg-white/8 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] items-center gap-1 rounded-2xl rounded-bl-none bg-white/8 p-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 delay-100"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 delay-200"></span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom input area */}
          <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-white/10 bg-white/5 p-3">
            <input
              type="text"
              placeholder="Ask anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-2xl border border-white/10 bg-white/8 px-3.5 py-2 text-xs font-semibold text-white placeholder:text-white/35 focus:border-[#ffcb2f] focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-2xl bg-[#ffcb2f] p-2.5 text-[#0b0d10] shadow-xs transition-colors hover:bg-white"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
