import React, { useState } from 'react';

/**
 * Reusable Chat Panel Component
 *
 * Props:
 * - title: string - The title shown in the header (default: "AI Assistant")
 * - subtitle: string - Optional subtitle/status text
 * - placeholder: string - Input placeholder text
 * - quickActions: array - Array of { label, icon } objects for quick action buttons
 * - onSendMessage: function - Callback when user sends a message (receives message string)
 * - initialMessages: array - Initial messages array of { role: 'user'|'assistant', content: string }
 * - collapsed: boolean - Control collapsed state externally (optional)
 * - onCollapsedChange: function - Callback when collapsed state changes (optional)
 * - accentColor: 'sage' | 'teal' | 'amber' - Theme color (default: 'sage')
 * - className: string - Additional CSS classes for the container
 */

const ChatPanel = ({
  title = "AI Assistant",
  subtitle = "Online",
  placeholder = "Type a message...",
  quickActions = [],
  onSendMessage,
  initialMessages = [],
  collapsed: controlledCollapsed,
  onCollapsedChange,
  accentColor = 'sage',
  className = '',
}) => {
  // State
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [messages, setMessages] = useState(
    initialMessages.length > 0
      ? initialMessages
      : [{ role: 'assistant', content: `Hello! I'm your AI assistant. How can I help you today?` }]
  );
  const [inputValue, setInputValue] = useState('');

  // Use controlled or internal collapsed state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const setCollapsed = (value) => {
    if (onCollapsedChange) {
      onCollapsedChange(value);
    } else {
      setInternalCollapsed(value);
    }
  };

  // Color themes using design system
  const colors = {
    sage: {
      gradient: 'from-sage to-sage-dark',
      light: 'bg-sage-tint',
      text: 'text-sage',
      button: 'bg-sage hover:bg-sage-dark',
      quickAction: 'bg-sage-tint hover:bg-sage-tint/80 text-sage-dark border border-sage/20',
      status: 'bg-sage',
      statusText: 'text-sage',
    },
    teal: {
      gradient: 'from-teal to-teal-dark',
      light: 'bg-teal-tint',
      text: 'text-teal',
      button: 'bg-teal hover:bg-teal-dark',
      quickAction: 'bg-teal-tint hover:bg-teal-tint/80 text-teal-dark border border-teal/20',
      status: 'bg-teal',
      statusText: 'text-teal',
    },
    amber: {
      gradient: 'from-amber to-amber-light',
      light: 'bg-amber-light/20',
      text: 'text-amber',
      button: 'bg-amber hover:bg-amber-light',
      quickAction: 'bg-amber-light/20 hover:bg-amber-light/30 text-amber border border-amber/20',
      status: 'bg-amber',
      statusText: 'text-amber',
    },
  };

  const theme = colors[accentColor] || colors.sage;

  // Handle sending messages
  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user', content: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);

    if (onSendMessage) {
      onSendMessage(inputValue.trim());
    }

    setInputValue('');
  };

  // Handle quick action click
  const handleQuickAction = (action) => {
    setInputValue(action.label);
  };

  // Add a message programmatically (useful for parent components)
  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  // Collapsed view
  if (isCollapsed) {
    return (
      <aside className={`w-12 bg-cream border-l border-border-light flex flex-col items-center py-4 shadow-soft-lg ${className}`}>
        <button
          onClick={() => setCollapsed(false)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${theme.light} hover:opacity-80 ${theme.text}`}
          title="Expand chat panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${theme.gradient}`}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span
            className="text-xs text-muted"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {title}
          </span>
        </div>
        {messages.length > 1 && (
          <div className="mt-auto mb-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${theme.light} ${theme.text}`}>
              {messages.length - 1}
            </div>
          </div>
        )}
      </aside>
    );
  }

  // Expanded view
  return (
    <aside className={`w-96 bg-cream border-l border-border-light flex flex-col shadow-soft-lg ${className}`}>
      {/* Header */}
      <div className="h-14 px-4 border-b border-border-light flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${theme.gradient}`}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-charcoal">{title}</div>
            <div className={`text-xs ${theme.statusText} flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 ${theme.status} rounded-full`}></span>
              {subtitle}
            </div>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-charcoal hover:bg-cream-dark transition-colors"
          title="Collapse chat panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4 bg-white">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%]">
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${theme.gradient}`}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs text-muted">{title}</span>
                </div>
              )}
              <div className={`rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-charcoal text-white rounded-br-md'
                  : 'bg-white text-charcoal rounded-bl-md border border-border-light shadow-soft'
              }`}>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content.split('**').map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="px-4 py-3 border-t border-border-light bg-cream">
          <div className="text-xs text-muted mb-2">Quick actions</div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleQuickAction(action)}
                className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-colors ${theme.quickAction}`}
              >
                {action.icon && <span>{action.icon}</span>}
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border-light bg-cream">
        <div className="flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 bg-white border border-border rounded-xl text-sm text-charcoal placeholder-muted resize-none focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
            rows={2}
            style={{ minHeight: '60px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors flex-shrink-0 ${theme.button}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="mt-2 text-xs text-muted text-center">
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>
    </aside>
  );
};

export default ChatPanel;
