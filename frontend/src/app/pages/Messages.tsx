import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { Send, User, Search, MoreVertical, Phone, Video, Smile, Paperclip } from 'lucide-react';
import { authGetJson, authPostJson } from '@/lib/api';

interface Conversation {
  _id: string;
  name: string;
  profilePhoto?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface UserProfile {
  id: string;
  name: string;
  profilePhoto?: string;
}

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
}

export function Messages() {
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('user');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setConversationsLoading(true);
      const data = await authGetJson<Conversation[]>('/messages/conversations');
      setConversations(data);
      
      if (initialUserId && !selectedUser) {
        const existingConv = data.find((c) => c._id === initialUserId);
        if (existingConv) {
          setSelectedUser(existingConv);
        } else {
          try {
            const profile = await authGetJson<UserProfile>(`/auth/user/${initialUserId}`);
            setSelectedUser({
              _id: profile.id,
              name: profile.name,
              profilePhoto: profile.profilePhoto,
              lastMessage: '',
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0,
            });
          } catch (profileError) {
            console.error('Failed to load user profile', profileError);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      setLoading(true);
      const data = await authGetJson<Message[]>(`/messages/${userId}`);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const data = await authPostJson<Message>('/messages', {
        receiverId: selectedUser._id,
        content: newMessage,
      });
      setMessages([...messages, data]);
      setNewMessage('');
      loadConversations(); // Refresh last message in list
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white/70 backdrop-blur-lg border border-border rounded-2xl overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-heading font-bold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-accent/50 border-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => setSelectedUser(conv)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors border-b border-border/50 ${
                  selectedUser?._id === conv._id ? 'bg-accent/80' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {conv.profilePhoto ? (
                    <img src={conv.profilePhoto} alt={conv.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">{conv.name}</h3>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedUser.name}</h3>
                  <p className="text-xs text-[#2CB67D]">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading && messages.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender !== selectedUser._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl ${
                          isMe
                            ? 'bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white rounded-tr-none'
                            : 'bg-accent/50 text-foreground rounded-tl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <span className={`text-[10px] block mt-1 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-white/50">
              <div className="flex items-center gap-2 bg-accent/50 rounded-2xl p-2">
                <button type="button" className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-2"
                />
                <button type="button" className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground">
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4">
              <Send className="w-10 h-10 opacity-20" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">Your Messages</h3>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
