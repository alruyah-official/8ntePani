import './Messages.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ─── Avatar helper ──────────────────────────────────────────────────────── */
function UserAvatar({ user, size = 'md' }) {
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  if (user?.avatar) {
    return <img src={user.avatar} alt={user.name} className={`avatar avatar-${size}`} />;
  }
  const sizes = { sm: 32, md: 44, lg: 64 };
  const px = sizes[size] || 44;
  return (
    <div
      className="avatar-placeholder"
      style={{ width: px, height: px, fontSize: px * 0.32 + 'px' }}
      aria-label={user?.name}
    >
      {initials}
    </div>
  );
}

/* ─── Time formatter ──────────────────────────────────────────────────────── */
function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function Messages() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [errorConvos, setErrorConvos] = useState(null);
  const [errorMessages, setErrorMessages] = useState(null);

  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const inputRef = useRef(null);

  /* ─── Fetch conversations list ──────────────────────────────────────────── */
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/api/conversations');
      setConversations(res.data.data.conversations);
      setErrorConvos(null);
    } catch {
      setErrorConvos('Failed to load conversations.');
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  /* ─── Fetch messages for active conversation ────────────────────────────── */
  const fetchMessages = useCallback(async (convId, silent = false) => {
    if (!convId) return;
    if (!silent) setLoadingMessages(true);
    try {
      const res = await api.get(`/api/conversations/${convId}`);
      const conv = res.data.data.conversation;
      setActiveConversation(conv);
      setMessages(conv.messages);
      setErrorMessages(null);
    } catch (err) {
      if (!silent) {
        setErrorMessages(
          err.response?.data?.message || 'Failed to load messages.'
        );
      }
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  /* ─── When conversationId param changes ─────────────────────────────────── */
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setActiveConversation(null);
      setMessages([]);
    }
  }, [conversationId, fetchMessages]);

  /* ─── Auto-scroll to bottom when messages change ────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ─── Poll for new messages every 3 seconds ─────────────────────────────── */
  useEffect(() => {
    if (conversationId) {
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(conversationId, true); // silent = true (no loading indicator)
        fetchConversations(); // also refresh convo list for last-message preview
      }, 3000);
    }
    return () => clearInterval(pollIntervalRef.current);
  }, [conversationId, fetchMessages, fetchConversations]);

  /* ─── Select conversation ────────────────────────────────────────────────── */
  const selectConversation = (convId) => {
    navigate(`/messages/${convId}`);
  };

  /* ─── Send message ───────────────────────────────────────────────────────── */
  const sendMessage = async (e) => {
    e.preventDefault();
    const content = messageInput.trim();
    if (!content || sendingMessage) return;

    setSendingMessage(true);
    try {
      const res = await api.post(`/api/conversations/${conversationId}/messages`, { content });
      const newMsg = res.data.data.message;
      setMessages(prev => [...prev, newMsg]);
      setMessageInput('');
      inputRef.current?.focus();
      // Also refresh conversations list to update preview
      fetchConversations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  /* ─── Get the other person in the conversation ───────────────────────────── */
  const getOtherUser = (conv) => {
    if (!conv || !user) return null;
    return user.id === conv.clientId ? conv.freelancer : conv.client;
  };

  /* ─── Handle Enter to send ───────────────────────────────────────────────── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const otherUser = activeConversation ? getOtherUser(activeConversation) : null;

  return (
    <div className="messages-layout">
      {/* ─── Left sidebar: conversation list ────────────────────────────────── */}
      <aside className="messages-sidebar">
        <div className="messages-sidebar-header">
          <h2 className="messages-sidebar-title">Messages</h2>
          {conversations.length > 0 && (
            <span className="badge badge-primary">{conversations.length}</span>
          )}
        </div>

        {loadingConvos ? (
          <div className="convo-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="convo-skeleton">
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 13, width: '60%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 11, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : errorConvos ? (
          <div className="messages-sidebar-error">
            <p>{errorConvos}</p>
            <button className="btn btn-ghost btn-sm" onClick={fetchConversations}>Retry</button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="messages-empty-convos">
            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>💬</div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
              {user?.role === 'CLIENT'
                ? 'No conversations yet. Contact a freelancer from a service page.'
                : 'No conversations yet. Clients will contact you here.'}
            </p>
          </div>
        ) : (
          <div className="convo-list">
            {conversations.map(conv => {
              const other = getOtherUser(conv);
              const lastMsg = conv.messages?.[0];
              const isActive = conversationId === conv.id;
              return (
                <button
                  key={conv.id}
                  className={`convo-item ${isActive ? 'convo-item-active' : ''}`}
                  onClick={() => selectConversation(conv.id)}
                  aria-label={`Conversation with ${other?.name}`}
                >
                  <UserAvatar user={other} size="md" />
                  <div className="convo-item-body">
                    <div className="convo-item-header">
                      <span className="convo-item-name">{other?.name || 'Unknown'}</span>
                      {lastMsg && (
                        <span className="convo-item-time">{formatTime(lastMsg.createdAt)}</span>
                      )}
                    </div>
                    <p className="convo-item-preview">
                      {lastMsg
                        ? (lastMsg.senderId === user?.id ? 'You: ' : '') + lastMsg.content
                        : 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* ─── Right panel: message thread ─────────────────────────────────────── */}
      <main className="messages-main">
        {!conversationId ? (
          /* Empty state — no conversation selected */
          <div className="messages-empty-thread">
            <div className="messages-empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-faint)' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the list to start messaging.</p>
          </div>
        ) : loadingMessages ? (
          <div className="loading-page">
            <div className="spinner" />
            <p>Loading messages...</p>
          </div>
        ) : errorMessages ? (
          <div className="messages-error-thread">
            <div className="error-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {errorMessages}
            </div>
            <button className="btn btn-secondary" onClick={() => fetchMessages(conversationId)}>Try Again</button>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="thread-header">
              <UserAvatar user={otherUser} size="md" />
              <div className="thread-header-info">
                <h3 className="thread-header-name">{otherUser?.name || 'Unknown'}</h3>
                <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                  {activeConversation?.clientId === otherUser?.id ? 'Client' : 'Freelancer'}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="thread-messages" aria-live="polite" aria-label="Message thread">
              {messages.length === 0 ? (
                <div className="thread-empty">
                  <p>No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === user?.id;
                  const prevMsg = messages[idx - 1];
                  const showSender = !prevMsg || prevMsg.senderId !== msg.senderId;
                  return (
                    <div
                      key={msg.id}
                      className={`message-group ${isMine ? 'message-group-mine' : 'message-group-theirs'}`}
                    >
                      {!isMine && showSender && (
                        <UserAvatar user={msg.sender} size="sm" />
                      )}
                      {isMine && <div style={{ width: 32 }} />}
                      <div className="message-content-wrapper">
                        {showSender && !isMine && (
                          <span className="message-sender-name">{msg.sender?.name}</span>
                        )}
                        <div className={`message-bubble ${isMine ? 'message-bubble-mine' : 'message-bubble-theirs'}`}>
                          {msg.content}
                        </div>
                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form className="thread-input-bar" onSubmit={sendMessage}>
              <textarea
                ref={inputRef}
                id="message-input"
                className="thread-input"
                placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={2000}
                aria-label="Message input"
                disabled={sendingMessage}
              />
              <button
                type="submit"
                id="send-message-btn"
                className={`btn btn-primary thread-send-btn ${sendingMessage ? 'btn-loading' : ''}`}
                disabled={!messageInput.trim() || sendingMessage}
                aria-label="Send message"
              >
                {!sendingMessage && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

export default Messages;
