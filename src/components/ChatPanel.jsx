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
 * - accentColor: 'blue' | 'purple' | 'emerald' | 'amber' - Theme color (default: 'purple')
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
  accentColor = 'purple',
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

  // Color themes
  const colors = {
    purple: {
      gradient: 'from-violet-500 to-purple-600',
      light: 'bg-violet-100',
      text: 'text-violet-600',
      button: 'bg-slate-900 hover:bg-slate-800',
      quickAction: 'bg-slate-100 hover:bg-slate-200 text-slate-600',
    },
    blue: {
      gradient: 'from-blue-500 to-cyan-600',
      light: 'bg-blue-100',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      quickAction: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200',
    },
    emerald: {
      gradient: 'from-emerald-500 to-teal-600',
      light: 'bg-emerald-100',
      text: 'text-emerald-600',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      quickAction: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200',
    },
    amber: {
      gradient: 'from-amber-500 to-orange-600',
      light: 'bg-amber-100',
      text: 'text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700',
      quickAction: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200',
    },
  };

  const theme = colors[accentColor] || colors.purple;

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
      <aside className={`w-12 bg-white border-l border-slate-200 flex flex-col items-center py-4 ${className}`}>
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
            className="text-xs text-slate-400" 
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
    <aside className={`w-96 bg-white border-l border-slate-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${theme.gradient}`}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{title}</div>
            <div className="text-xs text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              {subtitle}
            </div>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Collapse chat panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
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
                  <span className="text-xs text-slate-400">{title}</span>
                </div>
              )}
              <div className={`rounded-2xl px-4 py-2.5 ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-br-md' 
                  : 'bg-slate-100 text-slate-700 rounded-bl-md'
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
        <div className="px-4 py-3 border-t border-slate-100">
          <div className="text-xs text-slate-400 mb-2">Quick actions</div>
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
      <div className="p-4 border-t border-slate-200">
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
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300"
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
        <div className="mt-2 text-xs text-slate-400 text-center">
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>
    </aside>
  );
};

export default ChatPanel;

/* ============================================
   USAGE EXAMPLE
   ============================================

import ChatPanel from './ChatPanel';

function App() {
  const handleMessage = (message) => {
    console.log('User sent:', message);
    // Call your API here, then add assistant response
  };

  const quickActions = [
    { label: 'Help me write', icon: '✏️' },
    { label: 'Explain this', icon: '💡' },
    { label: 'Review code', icon: '👀' },
  ];

  return (
    <div className="flex h-screen">
      <main className="flex-1">
        {/* Your main content *//*}
      </main>
      
      <ChatPanel
        title="Code Assistant"
        subtitle="Ready to help"
        placeholder="Ask me anything..."
        quickActions={quickActions}
        onSendMessage={handleMessage}
        accentColor="blue"
        initialMessages={[
          { role: 'assistant', content: 'Hi! I can help you with your code.' }
        ]}
      />
    </div>
  );
}

*/
