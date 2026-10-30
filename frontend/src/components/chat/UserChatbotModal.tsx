import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Shield,
  Bot,
  User as UserIcon,
  Minimize2,
  RefreshCw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { chatbotService } from '../../services/chatbotService';
import { ChatMessageRecord } from '../../services/adminService';
import { authService } from '../../services/authService';

export const UserChatbotModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [inputText, setInputText] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [hasNewMessagesWhileScrolledUp, setHasNewMessagesWhileScrolledUp] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessagesCountRef = useRef(0);

  const currentUser = authService.getCurrentUser();

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 60;
    isAtBottomRef.current = atBottom;
    setShowScrollBottom(!atBottom);
    if (atBottom) {
      setHasNewMessagesWhileScrolledUp(false);
    }
  };

  useEffect(() => {
    if (currentUser?.email) {
      setUserEmail(currentUser.email);
      setUserName(currentUser.fullName || currentUser.username);
    } else {
      const storedGuestEmail = localStorage.getItem('dacentre_guest_chat_email');
      if (storedGuestEmail) {
        setUserEmail(storedGuestEmail);
      } else {
        const generated = 'user-' + Math.floor(1000 + Math.random() * 9000) + '@dacentre.com';
        setUserEmail(generated);
        localStorage.setItem('dacentre_guest_chat_email', generated);
      }
      setUserName('DA Centre Inquirer');
    }
  }, [currentUser]);

  // Polling for live messages
  useEffect(() => {
    if (!userEmail) return;

    const fetchMessages = async () => {
      try {
        const msgs = await chatbotService.getUserMessages(userEmail);
        setMessages((prev) => {
          if (
            prev.length === msgs.length &&
            (prev.length === 0 || prev[prev.length - 1]?.id === msgs[msgs.length - 1]?.id)
          ) {
            return prev;
          }
          return msgs;
        });

        if (!isOpen) {
          const adminUnread = msgs.filter((m) => m.sender === 'ADMIN' && !m.isRead).length;
          setUnreadCount(adminUnread);
        } else {
          setUnreadCount(0);
        }
      } catch {
        // quiet error on poll
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3500);
    return () => clearInterval(interval);
  }, [userEmail, isOpen]);

  // When modal is opened, scroll to latest message at the bottom
  useEffect(() => {
    if (isOpen) {
      isAtBottomRef.current = true;
      setShowScrollBottom(false);
      setHasNewMessagesWhileScrolledUp(false);
      const timer = setTimeout(() => {
        scrollToBottom('auto');
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-scroll when new messages arrive (only if viewing latest messages)
  useEffect(() => {
    if (!isOpen) {
      prevMessagesCountRef.current = messages.length;
      return;
    }

    if (messages.length > prevMessagesCountRef.current) {
      if (isAtBottomRef.current) {
        const timer = setTimeout(() => {
          scrollToBottom('smooth');
        }, 50);
        return () => clearTimeout(timer);
      } else {
        setHasNewMessagesWhileScrolledUp(true);
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const sent = await chatbotService.sendMessage({
        message: text,
        userEmail: userEmail || 'user@dacentre.com',
        userName: userName || 'DA Centre User',
        userId: currentUser?.id,
        userCustomId: currentUser?.customUserId,
      });

      isAtBottomRef.current = true;
      setShowScrollBottom(false);
      setHasNewMessagesWhileScrolledUp(false);
      setMessages((prev) => [...prev, sent]);
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err) {
      console.error('Failed to send chatbot query:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-xl border border-teal-500/30 backdrop-blur-md animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Chat directly with Admin</span>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setUnreadCount(0);
          }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 via-cyan-600 to-sky-600 hover:brightness-110 active:scale-95 text-white shadow-2xl shadow-cyan-500/40 flex items-center justify-center transition-all duration-300 border-2 border-white/40 cursor-pointer"
          title="DA Centre Support & Admin Query Chatbot"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 w-[92vw] sm:w-[400px] h-[520px] max-h-[80vh] rounded-3xl bg-slate-900/95 text-white shadow-2xl shadow-slate-950/60 border border-teal-500/30 backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border-b border-teal-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center shadow-inner">
                  <Bot className="w-5 h-5 text-teal-300" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight text-white">DA Centre Admin Desk</h3>
                  <span className="px-1.5 py-0.2 rounded-sm bg-teal-500/20 text-teal-300 text-[9px] font-black tracking-widest uppercase">
                    Direct
                  </span>
                </div>
                <p className="text-[11px] text-teal-200/70 flex items-center gap-1">
                  <span>Connected to Administrator Console</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* User ID Tag */}
          <div className="px-4 py-1.5 bg-slate-950/60 border-b border-slate-800/60 text-[10px] text-slate-400 flex items-center justify-between">
            <span>
              Sender: <strong className="text-teal-300 font-mono">{userEmail}</strong>
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live Admin Sync
            </span>
          </div>

          {/* Message History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-teal-500/20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-teal-400" />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Direct Administrator Support</h4>
                <p className="text-xs text-slate-400 max-w-[260px] leading-relaxed">
                  Have a question or request? Send your query here. It connects directly to the DA Centre Administrator desk.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isAdmin = m.sender === 'ADMIN';
                return (
                  <div
                    key={m.id || Math.random()}
                    className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {isAdmin ? (
                        <>
                          <Shield className="w-3 h-3 text-cyan-400" />
                          <span className="text-[10px] font-bold text-cyan-300">DA Centre Admin</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-medium text-slate-400">You</span>
                          <UserIcon className="w-3 h-3 text-slate-400" />
                        </>
                      )}
                      <span className="text-[9px] text-slate-500">
                        {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-md ${isAdmin
                        ? 'bg-gradient-to-br from-slate-800 to-slate-800/90 text-slate-100 border border-cyan-500/30 rounded-tl-sm'
                        : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-tr-sm shadow-cyan-900/30'
                        }`}
                    >
                      <p className="whitespace-pre-wrap">{m.message}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your query for the Admin..."
              disabled={isSending}
              className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-md shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {isSending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
};
