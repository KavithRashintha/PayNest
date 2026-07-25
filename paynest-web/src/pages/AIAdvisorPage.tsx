import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { aiApi, type ChatMessage } from '../api/ai';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

const SUGGESTED_PROMPTS = [
  'How am I doing financially this month?',
  'Are any of my budgets at risk?',
  'Give me 3 personalized tips to save money.',
  'Analyze my top spending categories.',
];

export const AIAdvisorPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello ${
        user?.fullName?.split(' ')[0] || 'there'
      }! I am your PayNest AI Financial Copilot. Ask me anything about your accounts, spending patterns, or budget advice!`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch AI Financial Health Insights
  const {
    data: insightsData,
    isLoading: isInsightsLoading,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: aiApi.getInsights,
    staleTime: 60000,
    retry: 1,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputMessage).trim();
    if (!prompt || isSending) return;

    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: prompt }];
    setMessages(newHistory);
    setInputMessage('');
    setIsSending(true);

    try {
      // Send conversation history (excluding initial bot greeting)
      const apiHistory = newHistory.slice(1);
      const res = await aiApi.chat(prompt, apiHistory);

      setMessages((prev) => [...prev, { role: 'assistant', content: res.response }]);
    } catch (err: any) {
      console.error('AI chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I'm having a brief issue connecting to my intelligence engine. Please make sure the AI service is active and try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const getHealthBadge = (health?: string) => {
    switch (health) {
      case 'HEALTHY':
        return {
          label: 'Financially Healthy',
          color: 'var(--emerald-400)',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.3)',
          icon: <ShieldCheck size={16} color="var(--emerald-400)" />,
        };
      case 'NEEDS_ATTENTION':
        return {
          label: 'Needs Attention',
          color: 'var(--rose-500)',
          bg: 'rgba(244, 63, 94, 0.15)',
          border: 'rgba(244, 63, 94, 0.3)',
          icon: <AlertTriangle size={16} color="var(--rose-500)" />,
        };
      default:
        return {
          label: 'Balanced Financial Status',
          color: 'var(--indigo-500)',
          bg: 'rgba(99, 102, 241, 0.15)',
          border: 'rgba(99, 102, 241, 0.3)',
          icon: <CheckCircle2 size={16} color="var(--indigo-500)" />,
        };
    }
  };

  const healthBadge = getHealthBadge(insightsData?.overallHealth);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: 'calc(100vh - 120px)' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Sparkles size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              AI Financial Advisor
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Real-time financial analysis, smart budget alerts, and AI copilot chat.
            </p>
          </div>
        </div>

        {/* Health Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: healthBadge.bg,
              border: `1px solid ${healthBadge.border}`,
            }}
          >
            {healthBadge.icon}
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: healthBadge.color }}>
              {healthBadge.label}
            </span>
          </div>

          <Button variant="secondary" size="sm" onClick={() => refetchInsights()}>
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Main Grid: Insights Sidebar + Chat Panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '24px',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Left Side: Financial Health Insights Panel */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--indigo-500)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              AI Insights Overview
            </h3>
          </div>

          {isInsightsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
              <Loader2 className="animate-spin" size={24} color="var(--indigo-500)" />
            </div>
          ) : (
            <>
              {/* Warnings */}
              {insightsData?.warnings && insightsData.warnings.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--rose-500)', textTransform: 'uppercase' }}>
                    Alerts & Warnings
                  </span>
                  {insightsData.warnings.map((w, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        fontSize: '0.825rem',
                        color: '#fb7185',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}
                    >
                      <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Key Insights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--indigo-500)', textTransform: 'uppercase' }}>
                  Key Analysis
                </span>
                {(insightsData?.insights || ['Your account balances and monthly cashflow are actively tracked.']).map(
                  (insight, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(99, 102, 241, 0.08)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        fontSize: '0.825rem',
                        color: 'var(--text-primary)',
                        lineHeight: 1.45,
                      }}
                    >
                      {insight}
                    </div>
                  )
                )}
              </div>

              {/* Savings Tips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald-400)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lightbulb size={14} />
                  Savings Tips
                </span>
                {(insightsData?.savingsTips || ['Set budget caps on top spending categories to increase net savings.']).map(
                  (tip, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        fontSize: '0.825rem',
                        color: 'var(--emerald-400)',
                        lineHeight: 1.45,
                      }}
                    >
                      {tip}
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Chat Interface */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Chat Stream Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bot size={20} color="var(--emerald-400)" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                PayNest Copilot Chat
              </span>
            </div>

            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Powered by Gemini & Financial LLM
            </span>
          </div>

          {/* Messages Scroll View */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    gap: '10px',
                  }}
                >
                  {!isUser && (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--gradient-emerald)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Bot size={18} color="#ffffff" />
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '12px 16px',
                      borderRadius: isUser ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                      backgroundColor: isUser ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: isUser
                        ? '1px solid rgba(99, 102, 241, 0.4)'
                        : '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.925rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {m.content}
                  </div>

                  {isUser && (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <UserIcon size={16} color="#ffffff" />
                    </div>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--gradient-emerald)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bot size={18} color="#ffffff" />
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '18px 18px 18px 2px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                  }}
                >
                  <Loader2 className="animate-spin" size={16} color="var(--emerald-400)" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Bar */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Suggested Prompts:
            </span>
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isSending}
                style={{
                  padding: '5px 11px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.775rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input & Send Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <input
              type="text"
              placeholder="Ask PayNest Copilot about your finances..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isSending}
              className="paynest-input"
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-primary)',
                fontSize: '0.925rem',
                outline: 'none',
              }}
            />

            <Button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              isLoading={isSending}
              style={{ borderRadius: 'var(--radius-full)', padding: '12px 20px' }}
            >
              <Send size={16} />
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
