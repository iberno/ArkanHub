import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { aiService } from '../services/ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: { label: string; action: string; payload?: any }[];
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Como posso ajudar?', suggestions: [
      { label: 'Meus tickets', action: 'navigate', payload: '/tickets' },
      { label: 'Criar ticket', action: 'navigate', payload: '/tickets?new=true' },
      { label: 'Base de conhecimento', action: 'navigate', payload: '/knowledge' },
    ]},
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const result = await aiService.sendMessage(text, conversationId);
      setConversationId(result.conversationId);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: result.response.reply,
        suggestions: result.response.suggestions,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente mais tarde.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (suggestion: { label: string; action: string; payload?: any }) => {
    if (suggestion.action === 'navigate' && suggestion.payload) {
      navigate(suggestion.payload);
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn btn-primary btn-circle fixed bottom-4 right-4 z-[100] shadow-lg"
        aria-label="Abrir chat"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-80 sm:w-96 shadow-2xl rounded-box bg-base-100 border border-base-300 flex flex-col max-h-[600px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-primary text-primary-content rounded-t-box">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <span className="font-semibold">Assistente Virtual</span>
        </div>
        <button onClick={() => setOpen(false)} className="btn btn-ghost btn-xs btn-circle text-primary-content">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px] max-h-[400px]">
        {messages.map((msg, i) => (
          <div key={i} className={`chat ${msg.role === 'user' ? 'chat-end' : 'chat-start'}`}>
            <div className={`chat-bubble text-sm ${msg.role === 'user' ? 'chat-bubble-primary' : ''}`}>
              {msg.content.split('\n').map((line, j) => (
                <p key={j} className={line.startsWith('•') ? 'ml-2' : ''}>{line}</p>
              ))}
              {msg.suggestions && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {msg.suggestions.map((s, j) => (
                    <button
                      key={j}
                      onClick={() => handleSuggestion(s)}
                      className="btn btn-xs btn-outline btn-ghost"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat chat-start">
            <div className="chat-bubble text-sm">
              <span className="loading loading-dots loading-xs" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-base-300 p-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          className="input input-bordered input-sm flex-1"
          disabled={loading}
        />
        <button onClick={handleSend} disabled={!input.trim() || loading} className="btn btn-primary btn-sm">
          {loading ? <span className="loading loading-spinner loading-xs" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
