import { useState, useEffect, useRef } from 'react';
import { Send, Search, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { useConversations, useMessages, useSendMessage } from '../hooks/useMessages';
import { formatDistanceToNow } from '../utils/formatDate';

export default function Messages() {
  const { user } = useAuth();
  const { emit, on, off } = useSocket();
  const [activeConvId, setActiveConvId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [localMessages, setLocalMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [convSearch, setConvSearch] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  const { data: convData, isLoading: convsLoading } = useConversations();
  const { data: msgData } = useMessages(activeConvId);
  const sendMsgMutation = useSendMessage();

  const conversations = convData?.data || MOCK_CONVERSATIONS;
  const filtered = conversations.filter(c =>
    c.otherUser?.name?.toLowerCase().includes(convSearch.toLowerCase())
  );

  // Load messages when conversation changes
  useEffect(() => {
    if (msgData?.data) setLocalMessages(msgData.data);
    else if (activeConvId) setLocalMessages(MOCK_MESSAGES);
  }, [msgData, activeConvId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // WebSocket listeners
  useEffect(() => {
    if (!activeConvId) return;
    emit('join_conversation', { conversationId: activeConvId });

    const removeMsg = on('new_message', (msg) => {
      if (msg.conversationId === activeConvId) {
        setLocalMessages(prev => [...prev, msg]);
      }
    });

    const removeTyping = on('typing', ({ name }) => {
      setTypingUser(name); setIsTyping(true);
    });
    const removeStopTyping = on('stopped_typing', () => {
      setIsTyping(false); setTypingUser('');
    });

    return () => { removeMsg?.(); removeTyping?.(); removeStopTyping?.(); };
  }, [activeConvId, emit, on]);

  function handleTyping() {
    emit('typing_start', { conversationId: activeConvId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      emit('typing_stop', { conversationId: activeConvId });
    }, 1500);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!messageText.trim()) return;
    const text = messageText.trim();
    setMessageText('');
    emit('typing_stop', { conversationId: activeConvId });

    // Optimistic update
    const optimistic = {
      id: Date.now(), conversationId: activeConvId,
      text, senderId: user.id,
      sender: { id: user.id, name: user.name, avatar: user.avatar },
      createdAt: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, optimistic]);

    try {
      await sendMsgMutation.mutateAsync({ conversationId: activeConvId, text });
    } catch { }
  }

  const activeConv = conversations.find(c => c.id === activeConvId);

  return (
    <div style={{
      display: 'flex', height: 'calc(100vh - 64px)', marginTop: 64,
      background: '#0a0a0a', overflow: 'hidden',
    }}>

      {/* Left: Conversation list */}
      <div style={{
        width: 320, flexShrink: 0, borderRight: '1px solid #1e1e1e',
        display: mobileShowThread ? 'none' : 'flex',
        flexDirection: 'column', background: '#0d0d0d',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #1e1e1e' }}>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: '#fafafa', marginBottom: 12 }}>Messages</h2>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
            <input value={convSearch} onChange={e => setConvSearch(e.target.value)}
              placeholder="Search conversations..."
              style={{ width: '100%', background: '#161616', border: '1px solid #222', borderRadius: 8, color: '#fafafa', fontSize: 13, padding: '8px 10px 8px 30px', outline: 'none', fontFamily: 'DM Sans,sans-serif' }}
            />
          </div>
        </div>

        {/* Conversation rows */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(conv => {
            const isActive = conv.id === activeConvId;
            const other = conv.otherUser || {};
            return (
              <div key={conv.id} onClick={() => { setActiveConvId(conv.id); setMobileShowThread(true); }}
                style={{
                  display: 'flex', gap: 12, padding: '14px 16px', cursor: 'pointer',
                  background: isActive ? '#161616' : 'transparent',
                  borderLeft: isActive ? '3px solid #C8F135' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <img src={other.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other.name || 'U')}&background=111&color=C8F135&size=40`}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} alt="" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#fafafa' }}>{other.name}</span>
                    <span style={{ fontSize: 11, color: '#555' }}>{conv.lastMessageAt ? formatDistanceToNow(conv.lastMessageAt) : ''}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                    <span style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{conv.lastMessage || 'No messages yet'}</span>
                    {conv.unread > 0 && (
                      <span style={{ background: '#C8F135', color: '#000', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '1px 6px', flexShrink: 0 }}>{conv.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Message thread */}
      <div style={{
        flex: 1, display: (!mobileShowThread && !activeConvId) ? 'none' : 'flex',
        flexDirection: 'column',
      }}>
        {!activeConvId ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 14 }}>Select a conversation to start messaging</div>
          </div>
        ) : (<>
          {/* Thread header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: 12, background: '#0d0d0d' }}>
            <button onClick={() => setMobileShowThread(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex' }}><ArrowLeft size={18} /></button>
            <img src={activeConv?.otherUser?.avatar || `https://ui-avatars.com/api/?name=User&background=111&color=C8F135&size=36`}
              style={{ width: 36, height: 36, borderRadius: '50%' }} alt="" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fafafa' }}>{activeConv?.otherUser?.name || 'User'}</div>
              {isTyping && <div style={{ fontSize: 11, color: '#C8F135' }}>{typingUser} is typing...</div>}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {localMessages.map(msg => {
              const isMe = msg.senderId === user?.id || msg.sender?.id === user?.id;
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '68%', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMe ? '#C8F135' : '#1a1a1a',
                    color: isMe ? '#000' : '#fafafa',
                    fontSize: 14, lineHeight: 1.5,
                  }}>
                    {msg.text}
                    <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4, textAlign: 'right' }}>
                      {msg.createdAt ? formatDistanceToNow(msg.createdAt) : ''}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '16px 20px', borderTop: '1px solid #1e1e1e', display: 'flex', gap: 10, background: '#0d0d0d' }}>
            <input value={messageText}
              onChange={e => { setMessageText(e.target.value); handleTyping(); }}
              placeholder="Type a message..."
              style={{ flex: 1, background: '#161616', border: '1px solid #222', borderRadius: 999, color: '#fafafa', fontSize: 14, padding: '10px 18px', outline: 'none', fontFamily: 'DM Sans,sans-serif' }}
            />
            <button type="submit" disabled={!messageText.trim()} style={{
              width: 42, height: 42, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: messageText.trim() ? '#C8F135' : '#222',
              color: messageText.trim() ? '#000' : '#555',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
            }}>
              <Send size={16} />
            </button>
          </form>
        </>)}
      </div>
    </div>
  );
}

// Mock data for development (removed when backend connects)
const MOCK_CONVERSATIONS = [
  { id: 'conv-1', otherUser: { id: 'u2', name: 'Priya Sharma', avatar: '' }, lastMessage: 'Sure, I can deliver by Friday!', lastMessageAt: new Date(Date.now() - 300000).toISOString(), unread: 2 },
  { id: 'conv-2', otherUser: { id: 'u3', name: 'Rahul Mehta', avatar: '' }, lastMessage: 'Please check the latest revision', lastMessageAt: new Date(Date.now() - 86400000).toISOString(), unread: 0 },
  { id: 'conv-3', otherUser: { id: 'u4', name: 'Sneha Nair', avatar: '' }, lastMessage: 'Thanks for the order!', lastMessageAt: new Date(Date.now() - 172800000).toISOString(), unread: 0 },
];

const MOCK_MESSAGES = [
  { id: 1, conversationId: 'conv-1', senderId: 'u2', sender: { id: 'u2', name: 'Priya Sharma' }, text: 'Hi! I saw your gig and I am interested.', createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: 2, conversationId: 'conv-1', senderId: 'dev-user-1', sender: { id: 'dev-user-1', name: 'Arjun Kumar' }, text: 'Thanks! Tell me more about your project.', createdAt: new Date(Date.now() - 500000).toISOString() },
  { id: 3, conversationId: 'conv-1', senderId: 'u2', sender: { id: 'u2', name: 'Priya Sharma' }, text: 'Sure, I can deliver by Friday!', createdAt: new Date(Date.now() - 300000).toISOString() },
];