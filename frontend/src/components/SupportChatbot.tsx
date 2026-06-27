'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, AlertCircle, ArrowUpRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  isLeadForm?: boolean;
}

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hi! I'm Fin, a conversational AI assistant. Ask me anything about Proofly—like widget embedding, video capture, pricing, or social reviews imports!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Lead Form States
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSuggestionClick = (suggestionText: string, queryKey: string) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: suggestionText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    triggerFinResponse(queryKey);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    
    // Trigger Fin AI conversation response
    triggerFinResponse(userText);
  };

  const triggerFinResponse = async (userInput: string) => {
    setIsTyping(true);
    
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_GRAPHQL_URL 
        ? process.env.NEXT_PUBLIC_GRAPHQL_URL.replace('/graphql', '/api/chat') 
        : 'http://localhost:4000/api/chat');

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userInput })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          setIsTyping(false);
          const isForm = userInput.toLowerCase().includes('human') || userInput.toLowerCase().includes('support') || userInput.toLowerCase().includes('agent') || userInput.toLowerCase().includes('talk') || userInput.toLowerCase().includes('help');
          setMessages(prev => [
            ...prev,
            {
              id: Math.random().toString(),
              sender: 'bot',
              text: data.reply,
              timestamp: new Date(),
              isLeadForm: isForm
            }
          ]);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend chatbot API call failed, using client-side fallback:', err);
    }

    // Client-side fallback if backend API fails
    const query = userInput.toLowerCase();
    setTimeout(() => {
      let responseText = '';
      let isForm = false;

      if (query.match(/^(hi|hello|hey|hlo|hola|howdy|yo|greetings|sup|good morning|good afternoon)/)) {
        responseText = "Hey there! 👋 I'm Fin, your Proofly assistant. How can I help you grow your business with social proof today?";
      } else if (query.includes('how are you') || query.includes('how\'s it going') || query.includes('how do you do')) {
        responseText = "I'm doing great, thank you! 🚀 Ready to help you gather some awesome customer testimonials. What's on your mind?";
      } else if (query.includes('who are you') || query.includes('your name') || query.includes('what is fin')) {
        responseText = "I'm Fin, the friendly AI support agent for Proofly! I can guide you on how to collect video testimonials, embed widgets, set up custom domains, or manage your billing plans.";
      } else if (query.includes('who created you') || query.includes('who made you') || query.includes('creator') || query.includes('developer')) {
        responseText = "I was created by the engineering team at Proofly to make customer feedback collection seamless and beautiful for everyone!";
      } else if (query.includes('collect') || query.includes('request') || query.includes('gather') || query.includes('link')) {
        responseText = "To collect testimonials:\n\n1. Head to your dashboard collections (`/dashboard/collections`).\n2. Click **Create Collection Space**.\n3. Input your branding preferences, reward coupons, and questions.\n4. Share the slug URL (e.g., `proofly.com/collect/your-slug`) with users. They can record high-fidelity video feedback or write text reviews instantly inside their browsers without installing anything!";
      } else if (query.includes('embed') || query.includes('widget') || query.includes('wall') || query.includes('carousel') || query.includes('code') || query.includes('iframe')) {
        responseText = "Proofly offers responsive script embeds:\n\n• **Wall of Love**: A masonry grid display featuring highlights.\n• **Carousel**: Interactive horizontal sliders.\n• **Playground**: Tweak spacing, tilt intensity, and copy custom code at `/demo`.\n\nTo install, copy the `<iframe src=\"...\" />` code block from the dashboard and paste it inside Webflow, Framer, React, or standard HTML containers.";
      } else if (query.includes('pricing') || query.includes('cost') || query.includes('plan') || query.includes('free') || query.includes('upgrade') || query.includes('pro') || query.includes('business')) {
        responseText = "We offer four billing tiers:\n\n• **Free ($0)**: 1 collection space, 10 text reviews, and standard masonry layouts.\n• **Pro ($49/mo)**: 5 active spaces, webcam video reviews capture, and customized styling accents.\n• **Business ($99/mo)**: Unlimited video reviews, AI keyword trends, and custom domains settings.\n• **Enterprise ($249/mo)**: Semantic vector searches and priority help.\n\nYou can trigger upgrades via the billing setting triggers (`/dashboard/settings`).";
      } else if (query.includes('video') || query.includes('webcam') || query.includes('camera') || query.includes('record')) {
        responseText = "Our webcam recording is fully built on HTML5 video streaming:\n\n• Users record directly inside the public collectors screen.\n• Once uploaded, our server transcribes the speech, tags highlights, and analyzes client sentiment.\n• Admins can review details in the dashboard inbox and click **Approve** to showcase it instantly!";
      } else if (query.includes('ai') || query.includes('insights') || query.includes('sentiment') || query.includes('keyword') || query.includes('transcript')) {
        responseText = "Proofly has integrated NLP pipelines:\n\n• **Auto-Transcripts**: Closed captioning and text extraction for all webcam videos.\n• **Sentiment Detection**: Classifies reviews as POSITIVE, NEUTRAL, or NEGATIVE.\n• **Keyword Mapping**: Extracts key search tags.\n• **Highlights Summaries**: Creates a bold summary snippet (`bestQuoteHighlight`) featured at the top of cards.";
      } else if (query.includes('search') || query.includes('vector') || query.includes('semantic')) {
        responseText = "Our dashboard features an AI Semantic Vector Search bar. Users can search their testimonials library using natural sentences (e.g. 'Show reviews from founders who liked onboarding'). The system maps semantic meanings rather than literal matches to return relevant records instantly.";
      } else if (query.includes('api') || query.includes('rest') || query.includes('integration') || query.includes('developer')) {
        responseText = "Yes! Proofly is developer-friendly. We expose full JSON API endpoints for fetching approved testimonials dynamically, allowing you to build custom client grids. Refer to developer sandbox settings at `/demo` for embed configurations.";
      } else if (query.includes('import') || query.includes('google') || query.includes('linkedin') || query.includes('twitter') || query.includes('reddit')) {
        responseText = "To import reviews from external platforms:\n\n1. Navigate to the **Imports** dashboard (`/dashboard/imports`).\n2. Select your platform (Google Reviews, Twitter/X, LinkedIn, Reddit, or G2).\n3. Input reviews slugs or authorize syncing.\n4. Proofly imports the reviews into your inbox, preserving avatars, authors, and ratings.";
      } else if (query.includes('human') || query.includes('support') || query.includes('agent') || query.includes('talk') || query.includes('help')) {
        responseText = "Got it. I can loop in a human representative. Please fill in your contact information below, and our support lead will email you within 15 minutes:";
        isForm = true;
      } else if (query.match(/^(thanks|thank you|awesome|cool|great|nice|perfect|ok|okay)/)) {
        responseText = "You're very welcome! Let me know if there's anything else I can assist you with. Happy collecting! 🚀";
      } else {
        responseText = `I've analyzed our documentation database regarding your question ("${userInput}").\n\nProofly supports fully responsive widget customizers, smart NLP sentiment analysis, and social platform integrations.\n\nIf you have a specific question about setup or features, feel free to ask about 'webcam recording', 'getting widget embeds', 'billing plans', or type 'human' to submit a support email!`;
      }

      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: responseText,
          timestamp: new Date(),
          isLeadForm: isForm
        }
      ]);
    }, 1000);
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail) return;

    setLeadSubmitted(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: `Thanks ${leadName}! I've logged ticket #PT-${Math.floor(Math.random() * 9000 + 1000)}. Our support lead will contact you at ${leadEmail} shortly.`,
          timestamp: new Date()
        }
      ]);
      setLeadName('');
      setLeadEmail('');
      setLeadSubmitted(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Toggle Button (Sleek Fin Branding) */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 bg-black border border-zinc-800 rounded-full flex items-center justify-center text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)] cursor-pointer hover:border-brand-teal/50 transition-all duration-300 relative group"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-slate-400 group-hover:text-white" />
          ) : (
            <div className="relative flex items-center justify-center">
              {/* Glowing Fin Blue-Teal Pulse ring */}
              <span className="absolute inset-0 w-full h-full rounded-full bg-brand-teal/15 scale-120 animate-ping pointer-events-none" />
              {/* Fin Logo SVG */}
              <svg viewBox="0 0 40 40" className="w-9 h-9">
                <circle cx="20" cy="20" r="18" fill="#0c0c0e" stroke="#27272a" strokeWidth="1" />
                {/* Purple to Teal Gradient AI symbol */}
                <path 
                  d="M13 15 C13 13, 27 13, 27 15 C27 20, 13 20, 13 25 C13 27, 27 27, 27 25" 
                  fill="none" 
                  stroke="url(#finLogoGrad)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                />
                <defs>
                  <linearGradient id="finLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4338CA" />
                    <stop offset="50%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Box Panel (Intercom Fin Style) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="fixed bottom-24 right-6 w-[360px] max-h-[550px] h-[520px] bg-black border border-zinc-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden text-left"
          >
            {/* Fin AI Header */}
            <div className="p-4 bg-gradient-to-r from-purple-950/15 via-[#09090B] to-brand-teal/15 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center relative overflow-hidden">
                  <svg viewBox="0 0 40 40" className="w-full h-full p-1">
                    <path 
                      d="M13 15 C13 13, 27 13, 27 15 C27 20, 13 20, 13 25 C13 27, 27 27, 27 25" 
                      fill="none" 
                      stroke="url(#finLogoGrad)" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-brand-teal border border-black animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white">Fin AI Assistant</span>
                    <span className="bg-brand-teal/10 text-brand-teal px-1 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-wider">AI Support</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block flex items-center space-x-1">
                    <span>Answers instantly ·</span>
                    <a 
                      href="https://fin.ai/?referer=messenger" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-brand-teal transition underline font-semibold flex items-center"
                    >
                      <span>Intercom Fin</span>
                      <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
                    </a>
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start space-x-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-brand-teal shrink-0 mt-0.5">
                      <svg viewBox="0 0 40 40" className="w-4 h-4">
                        <path 
                          d="M13 15 C13 13, 27 13, 27 15 C27 20, 13 20, 13 25 C13 27, 27 27, 27 25" 
                          fill="none" 
                          stroke="url(#finLogoGrad)" 
                          strokeWidth="4.5" 
                          strokeLinecap="round" 
                        />
                      </svg>
                    </div>
                  )}
                  
                  <div className="max-w-[80%] flex flex-col space-y-1">
                    {msg.isLeadForm ? (
                      <div className="bg-[#0c0c0e] border border-zinc-800 p-3.5 rounded-xl space-y-3">
                        <p className="text-xs text-slate-300 font-semibold">{msg.text}</p>
                        <form onSubmit={handleLeadSubmit} className="space-y-2">
                          <input
                            type="text"
                            placeholder="Your Name"
                            required
                            value={leadName}
                            onChange={(e) => setLeadName(e.target.value)}
                            className="w-full bg-[#09090B] border border-zinc-800 p-2 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-brand-teal"
                          />
                          <input
                            type="email"
                            placeholder="Your Email"
                            required
                            value={leadEmail}
                            onChange={(e) => setLeadEmail(e.target.value)}
                            className="w-full bg-[#09090B] border border-zinc-800 p-2 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-brand-teal"
                          />
                          <button
                            type="submit"
                            className="w-full bg-brand-teal text-black font-extrabold py-2 rounded text-xs uppercase tracking-wider cursor-pointer hover:opacity-90 transition"
                          >
                            Send Support Ticket
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className={`p-3 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-[#1e1b4b] text-zinc-100 rounded-tr-none'
                          : 'bg-zinc-900 text-slate-200 border border-zinc-800/80 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    )}
                    <span className="text-[8px] text-zinc-600 font-mono self-start pl-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-[#1e1b4b]/80 border border-[#312e81] text-indigo-300 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                      U
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start space-x-2.5">
                  <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <svg viewBox="0 0 40 40" className="w-4 h-4">
                      <path 
                        d="M13 15 C13 13, 27 13, 27 15 C27 20, 13 20, 13 25 C13 27, 27 27, 27 25" 
                        fill="none" 
                        stroke="url(#finLogoGrad)" 
                        strokeWidth="4.5" 
                        strokeLinecap="round" 
                      />
                    </svg>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl rounded-tl-none flex space-x-1 items-center">
                    <div className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Suggestions Quick Buttons */}
              {messages.length === 1 && !isTyping && (
                <div className="pt-2 pl-8 space-y-1.5">
                  <span className="text-[9px] font-extrabold text-zinc-600 uppercase tracking-widest block mb-1">Fin Help Directory</span>
                  <button
                    onClick={() => handleSuggestionClick("💬 How do I collect testimonials?", "collect")}
                    className="w-full text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-brand-teal/40 p-2.5 rounded-lg text-[10px] font-bold text-slate-400 cursor-pointer block transition"
                  >
                    💬 How do I collect testimonials?
                  </button>
                  <button
                    onClick={() => handleSuggestionClick("🚀 How do I embed a Wall of Love?", "embed")}
                    className="w-full text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-brand-teal/40 p-2.5 rounded-lg text-[10px] font-bold text-slate-400 cursor-pointer block transition"
                  >
                    🚀 How do I embed a Wall of Love?
                  </button>
                  <button
                    onClick={() => handleSuggestionClick("💳 Which plan should I choose?", "pricing")}
                    className="w-full text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-brand-teal/40 p-2.5 rounded-lg text-[10px] font-bold text-slate-400 cursor-pointer block transition"
                  >
                    💳 Which plan should I choose?
                  </button>
                  <button
                    onClick={() => handleSuggestionClick("🧑‍💻 Request human representative", "human")}
                    className="w-full text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-brand-teal/40 p-2.5 rounded-lg text-[10px] font-bold text-slate-400 cursor-pointer block transition"
                  >
                    🧑‍💻 Request human representative
                  </button>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-800 bg-[#09090b] flex space-x-2">
              <input
                type="text"
                placeholder="Ask Fin a question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-teal"
              />
              <button
                type="submit"
                className="bg-brand-teal text-black w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer shadow shadow-brand-teal/20 transition hover:opacity-90 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="bg-[#09090b] pb-2.5 text-center border-t border-zinc-800/20 pt-1.5 shrink-0">
              <a 
                href="https://fin.ai/?referer=messenger" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[8px] text-zinc-500 hover:text-brand-teal transition inline-flex items-center space-x-0.5"
              >
                <span>Powered by</span>
                <span className="font-extrabold flex items-center">
                  Fin AI <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
                </span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
