import { API_BASE, SOCKET_URL } from '../../config/api';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Phone, Video, MoreVertical, 
  Paperclip, Send, Smile, Image as ImageIcon, 
  FileText, Download, Check, CheckCheck, X, Loader,
  ArrowLeft, Pin, Star, Trash2, Edit3, ThumbsUp,
  Heart, Laugh, PartyPopper, Frown, Hand,
  MessageSquare, Users, Bookmark, User, Settings,
  Share2, Link as LinkIcon, Eye, Archive, Tag,
  Plus, ChevronDown, Clock, Copy, Flag, Bell
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import Avatar from './Avatar';
import { useNavigate } from 'react-router-dom';

const REACTIONS = ['👍', '❤️', '😂', '🎉', '😮', '👏'];

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getSenderName = (id, participants) => {
  const p = participants?.find(p => p._id === id || p._id?.toString() === id?.toString());
  return p?.name || 'Unknown';
};

export const GlobalChat = ({ user }) => {
  const navigate = useNavigate();
  const [activeConvId, setActiveConvId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showRightPanel, setShowRightPanel] = useState(null);
  
  const [conversationLabel, setConversationLabel] = useState('');
  const [sharedFiles, setSharedFiles] = useState([]);
  const [starredMsgs, setStarredMsgs] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [editText, setEditText] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [showMobileList, setShowMobileList] = useState(true);
  const [userLabels, setUserLabels] = useState([]);
  const [showAddLabelInput, setShowAddLabelInput] = useState(false);
  const [newLabelValue, setNewLabelValue] = useState('');
  const [showDeleteMsgMenu, setShowDeleteMsgMenu] = useState(null);
  const [notes, setNotes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteTitle, setEditNoteTitle] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [editGoalId, setEditGoalId] = useState(null);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [filesSearch, setFilesSearch] = useState('');
  const [starredSearch, setStarredSearch] = useState('');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isAlumni = user?.role === 'alumni';

  // Socket setup
  useEffect(() => {
    if (!user) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('setup', user);

    socket.on('message:receive', (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      setConversations(prev => prev.map(c => {
        if (c._id === msg.conversation) {
          return { ...c, lastMessage: msg.content || msg.fileName || '📎', lastMessageTime: msg.createdAt, unreadCount: (c._id !== activeConvId ? (c.unreadCount || 0) + 1 : c.unreadCount || 0) };
        }
        return c;
      }));
      fetchConversations();
    });

    socket.on('message:edited', (msg) => {
      setMessages(prev => prev.map(m => m._id === msg._id ? msg : m));
    });

    socket.on('message:deleted', ({ messageId, conversationId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    });

    socket.on('message:reaction', (msg) => {
      setMessages(prev => prev.map(m => m._id === msg._id ? msg : m));
    });

    socket.on('message:seen', ({ conversationId }) => {
      setMessages(prev => prev.map(m => {
        if (m.conversation === conversationId && m.sender !== user._id) {
          return { ...m, isRead: true, readAt: new Date() };
        }
        return m;
      }));
    });

    socket.on('message:typing', ({ conversationId, userId, isTyping: typing }) => {
      if (conversationId === activeConvId && userId !== user._id) {
        setIsTyping(typing);
        setTypingUser(userId);
      }
    });

    socket.on('user:online', ({ userId }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: 'online' }));
    });

    socket.on('user:offline', ({ userId }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: 'offline' }));
    });

    socket.on('conversation:update', () => {
      fetchConversations();
    });

    socket.on('note:created', (note) => {
      setNotes(prev => [note, ...prev.filter(n => n._id !== note._id)]);
    });
    socket.on('note:updated', (note) => {
      setNotes(prev => prev.map(n => n._id === note._id ? note : n));
    });
    socket.on('note:deleted', ({ noteId }) => {
      setNotes(prev => prev.filter(n => n._id !== noteId));
    });

    socket.on('goal:created', (goal) => {
      setGoals(prev => [goal, ...prev.filter(g => g._id !== goal._id)]);
    });
    socket.on('goal:updated', (goal) => {
      setGoals(prev => prev.map(g => g._id === goal._id ? goal : g));
    });
    socket.on('goal:deleted', ({ goalId }) => {
      setGoals(prev => prev.filter(g => g._id !== goalId));
    });

    socket.on('reminder:created', (reminder) => {
      setReminders(prev => [reminder, ...prev.filter(r => r._id !== reminder._id)]);
    });
    socket.on('reminder:deleted', ({ reminderId }) => {
      setReminders(prev => prev.filter(r => r._id !== reminderId));
    });

    return () => socket.disconnect();
  }, [user]);

  // Update conversations when activeConvId changes for unread count
  useEffect(() => {
    if (activeConvId) {
      setConversations(prev => prev.map(c => 
        c._id === activeConvId ? { ...c, unreadCount: 0 } : c
      ));
    }
  }, [activeConvId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConvId) return;
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/chat/conversations/${activeConvId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.messages || []);
        setNotes(res.data.notes || []);
        setGoals(res.data.goals || []);
        setReminders(res.data.reminders || []);
        setConversationLabel(res.data.label || '');
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    };
    fetchMessages();
  }, [activeConvId]);

  // Scroll to bottom on conversation change
  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [activeConvId]);

  // Fetch labels for the label picker
  const fetchLabels = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/chat/labels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserLabels(res.data);
    } catch (err) {
      console.error('Failed to load labels', err);
    }
  };

  useEffect(() => {
    if (isAlumni && (showRightPanel === 'files' || showRightPanel === 'goals' || showRightPanel === 'reminders')) {
      fetchLabels();
    }
  }, [isAlumni, showRightPanel]);

  const handleSend = async () => {
    if (!messageText.trim() && !selectedFile) return;
    try {
      const token = localStorage.getItem('token');
      let fileUrl = null, fileName = null, fileSize = null, msgType = 'text';

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder', 'chat');
        const uploadRes = await axios.post(`${API_BASE}/users/upload`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        fileUrl = uploadRes.data.url;
        fileName = selectedFile.name;
        fileSize = (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB';
        msgType = selectedFile.type.startsWith('image/') ? 'image' : 'file';
      }

      const res = await axios.post(`${API_BASE}/chat/conversations/${activeConvId}/messages`, {
        content: messageText,
        messageType: msgType,
        fileUrl,
        fileName,
        fileSize
      }, { headers: { Authorization: `Bearer ${token}` } });

      setMessages(prev => [...prev, res.data]);
      setMessageText('');
      setSelectedFile(null);
      setShowAttachMenu(false);
      fetchConversations();
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (socketRef.current && activeConvId && otherUser?._id) {
      socketRef.current.emit('message:typing', { conversationId: activeConvId, userId: user._id, isTyping: true, receiverId: otherUser._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('message:typing', { conversationId: activeConvId, userId: user._id, isTyping: false, receiverId: otherUser._id });
      }, 1500);
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE}/chat/messages/${messageId}/reaction`, { emoji }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions: res.data.reactions || [] } : m));
      setShowReactionPicker(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim() || !editingMsg) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/chat/messages/${editingMsg._id}`, { content: editText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingMsg(null);
      setEditText('');
    } catch (err) {
      toast.error('Failed to edit message');
    }
  };

  const handleDelete = async (messageId, deleteFor) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/chat/messages/${messageId}`, {
        data: { deleteFor },
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.filter(m => m._id !== messageId));
      setContextMenu(null);
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const handleTogglePin = async (convId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/chat/conversations/${convId}/pin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStar = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/chat/messages/${messageId}/star`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStarred();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveLabel = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/chat/conversations/${activeConvId}/label`, { label: conversationLabel }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Label saved');
      fetchConversations();
    } catch (err) {
      toast.error('Failed to save label');
    }
  };

  const fetchSharedFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/chat/conversations/${activeConvId}/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSharedFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStarred = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/chat/starred`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStarredMsgs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const createNote = async () => {
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/chat/conversations/${activeConvId}/notes`, {
        title: newNoteTitle.trim(),
        content: newNoteContent.trim()
      }, { headers: { Authorization: `Bearer ${token}` } });
      setNotes(prev => [res.data, ...prev]);
      setNewNoteTitle('');
      setNewNoteContent('');
      toast.success('Note created');
    } catch (err) {
      toast.error('Failed to create note');
    }
  };

  const updateNote = async (noteId, title, content) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE}/chat/notes/${noteId}`, {
        title, content
      }, { headers: { Authorization: `Bearer ${token}` } });
      setNotes(prev => prev.map(n => n._id === noteId ? res.data : n));
      setEditNoteId(null);
      setEditNoteTitle('');
      setEditNoteContent('');
      toast.success('Note updated');
    } catch (err) {
      toast.error('Failed to update note');
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/chat/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(prev => prev.filter(n => n._id !== noteId));
      toast.success('Note deleted');
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoalTitle.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const payload = { title: newGoalTitle.trim() };
      if (newGoalDeadline) payload.deadline = newGoalDeadline;
      const res = await axios.post(`${API_BASE}/chat/conversations/${activeConvId}/goals`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(prev => [...prev, res.data]);
      setNewGoalTitle('');
      setNewGoalDeadline('');
      setShowGoalForm(false);
      toast.success('Goal created');
    } catch (err) {
      toast.error('Failed to create goal');
    }
  };

  const handleUpdateGoal = async (goalId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE}/chat/goals/${goalId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(prev => prev.map(g => g._id === goalId ? res.data : g));
      setEditGoalId(null);
      toast.success('Goal updated');
    } catch (err) {
      toast.error('Failed to update goal');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/chat/goals/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(prev => prev.filter(g => g._id !== goalId));
      toast.success('Goal deleted');
    } catch (err) {
      toast.error('Failed to delete goal');
    }
  };

  const handleCreateReminder = async () => {
    if (!newReminderTitle.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const payload = { title: newReminderTitle.trim() };
      if (newReminderDate) payload.reminderDate = newReminderDate;
      if (newReminderTime) payload.reminderTime = newReminderTime;
      const res = await axios.post(`${API_BASE}/chat/conversations/${activeConvId}/reminders`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(prev => [...prev, res.data]);
      setNewReminderTitle('');
      setNewReminderDate('');
      setNewReminderTime('');
      setShowReminderForm(false);
      toast.success('Reminder set');
    } catch (err) {
      toast.error('Failed to create reminder');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/chat/reminders/${reminderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(prev => prev.filter(r => r._id !== reminderId));
      toast.success('Reminder deleted');
    } catch (err) {
      toast.error('Failed to delete reminder');
    }
  };

  const activeConv = conversations.find(c => c._id === activeConvId);
  const otherUser = activeConv?.otherParticipant;
  const isUserOnline = onlineUsers[otherUser?._id] === 'online';
  const filteredConvs = conversations.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.otherParticipant?.fullName?.toLowerCase().includes(q) ||
           c.otherParticipant?.department?.toLowerCase().includes(q) ||
           c.lastMessage?.toLowerCase().includes(q) ||
           (c.label || '').toLowerCase().includes(q);
  });

  const renderMessage = (msg) => {
    const isMe = msg.sender?._id === user._id || msg.sender === user._id;
    const reactions = msg.reactions || [];
    const reactionSummary = reactions.reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});

    return (
      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3 relative group`}>
        <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
          <div
            onContextMenu={(e) => { e.preventDefault(); setContextMenu(contextMenu === msg._id ? null : msg._id); }}
            className={`relative px-4 py-2.5 rounded-2xl ${
              isMe
                ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-br-sm'
                : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm'
            }`}
          >
            {msg.messageType === 'image' && msg.fileUrl && (
              <img src={msg.fileUrl} alt="Shared" className="max-w-full rounded-lg mb-2 max-h-64 object-cover cursor-pointer" onClick={() => window.open(msg.fileUrl, '_blank')} />
            )}
            {msg.messageType === 'file' && msg.fileUrl && (
              <div className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${isMe ? 'bg-white/10' : 'bg-gray-50'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMe ? 'bg-white/20' : 'bg-purple-100 text-purple-600'}`}>
                  {msg.fileName?.includes('.pdf') ? <FileText className="w-5 h-5" /> : msg.fileName?.includes('.zip') ? <Archive className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${isMe ? 'text-white' : 'text-gray-900'}`}>{msg.fileName || 'File'}</p>
                  {msg.fileSize && <p className={`text-xs ${isMe ? 'text-purple-200' : 'text-gray-500'}`}>{msg.fileSize}</p>}
                </div>
                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-black/10 transition-colors shrink-0">
                  <Download className="w-4 h-4" />
                </a>
              </div>
            )}
            {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
            {msg.isEdited && <span className={`text-[10px] ${isMe ? 'text-purple-200' : 'text-gray-500'} italic`}>Edited</span>}

            {/* Reactions */}
            {Object.keys(reactionSummary).length > 0 && (
              <div className={`flex gap-0.5 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {Object.entries(reactionSummary).map(([emoji, count]) => (
                  <span key={emoji} className="text-xs bg-white/80 rounded-full px-1.5 py-0.5 shadow-sm border border-gray-100">{emoji} {count > 1 ? count : ''}</span>
                ))}
              </div>
            )}
          </div>

          {/* Time + Status + Reaction button */}
          <div className={`flex items-center gap-1.5 mt-0.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-gray-500">{formatTime(msg.createdAt)}</span>
            {isMe && (
              msg.isRead
                ? <CheckCheck className="w-3 h-3 text-blue-500" />
                : <Check className="w-3 h-3 text-gray-500" />
            )}
            {/* Copy button */}
            {msg.content && (
              <button onClick={() => handleCopyMessage(msg.content)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-600">
                <Copy className="w-3 h-3" />
              </button>
            )}
            {/* Star button */}
            <button onClick={() => { handleToggleStar(msg._id); setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isStarred: !m.isStarred } : m)); }} className={`opacity-0 group-hover:opacity-100 transition-opacity ${msg.isStarred ? 'text-amber-500 opacity-100' : 'text-gray-500 hover:text-amber-500'}`}>
              <Star className="w-3 h-3" />
            </button>
            <button onClick={() => setShowReactionPicker(showReactionPicker === msg._id ? null : msg._id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-purple-500">
              <Smile className="w-3.5 h-3.5" />
            </button>
            {isMe && (
              <>
                <button onClick={() => { setEditingMsg(msg); setEditText(msg.content); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-blue-500">
                  <Edit3 className="w-3 h-3" />
                </button>
                <div className="relative">
                  <button onClick={() => setShowDeleteMsgMenu(showDeleteMsgMenu === msg._id ? null : msg._id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <AnimatePresence>
                    {showDeleteMsgMenu === msg._id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute bottom-full right-0 mb-1 bg-white rounded-xl shadow-xl border border-gray-100 p-1 z-30 min-w-[140px]"
                      >
                        <button onClick={() => { handleDelete(msg._id, 'me'); setShowDeleteMsgMenu(null); }} className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Delete for Me</button>
                        <button onClick={() => { handleDelete(msg._id, 'everyone'); setShowDeleteMsgMenu(null); }} className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg">Delete for Everyone</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* Reaction picker popup */}
            <AnimatePresence>
              {showReactionPicker === msg._id && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.9 }}
                  className="absolute -top-10 left-0 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 flex gap-1 z-20"
                >
                  {REACTIONS.map(emoji => (
                    <button key={emoji} onClick={() => handleReaction(msg._id, emoji)} className="w-7 h-7 hover:bg-gray-100 rounded-lg text-sm flex items-center justify-center transition-colors hover:scale-125">
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex h-[calc(100vh-10rem)] bg-white/60 items-center justify-center rounded-3xl border border-gray-100"><Loader className="w-8 h-8 animate-spin text-purple-600" /></div>;
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white/60 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
      {/* CONVERSATION LIST */}
      <div className={`${showMobileList || !activeConvId ? 'flex' : 'hidden'} md:flex w-full md:w-80 bg-white/50 border-r border-gray-100 flex-col shrink-0 ${activeConvId ? 'md:flex' : ''}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filteredConvs.length === 0 ? (
            <div className="p-8 text-center text-gray-500 mt-10">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium">No conversations available yet.</p>
            </div>
          ) : (
            filteredConvs.map(conv => (
              <div
                key={conv._id}
                onClick={() => { setActiveConvId(conv._id); setShowMobileList(false); }}
                className={`p-4 flex gap-3 cursor-pointer transition-all border-l-2 ${
                  activeConvId === conv._id ? 'bg-purple-50/60 border-l-purple-500' : 'border-l-transparent hover:bg-gray-50/50'
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar src={conv.otherParticipant?.profilePhoto} alt={conv.otherParticipant?.fullName} size={48} className="border border-gray-200" />
                  {onlineUsers[conv.otherParticipant?._id] === 'online' && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-bold text-gray-900 text-sm truncate flex items-center gap-1.5">
                      {conv.otherParticipant?.fullName || 'Unknown'}
                      {conv.isPinned && <Pin className="w-3 h-3 text-purple-500" />}
                      {conv.label && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">{conv.label}</span>}
                    </h4>
                    <span className="text-[10px] text-gray-500 shrink-0 ml-2">{formatTime(conv.lastMessageTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                    <span className={`shrink-0 px-1.5 py-px rounded-full text-[9px] font-semibold uppercase ${conv.otherParticipant?.role === 'alumni' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {conv.otherParticipant?.role === 'alumni' ? 'Alumni' : conv.otherParticipant?.role === 'student' ? 'Student' : ''}
                    </span>
                    <p className="truncate">{conv.otherParticipant?.department || ''}</p>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="shrink-0 mt-2 w-5 h-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className={`${!showMobileList && activeConvId ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0 bg-white/40 ${!activeConvId ? 'md:flex' : ''}`}>
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 md:px-6 border-b border-gray-100 flex items-center justify-between bg-white/50 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setShowMobileList(true)} className="md:hidden p-1.5 -ml-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative shrink-0">
                  <Avatar src={otherUser?.profilePhoto} alt={otherUser?.fullName} size={48} className="border border-gray-200" />
                  {isUserOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight truncate flex items-center gap-1.5">
                    {otherUser?.fullName || 'Unknown'}
                    {conversationLabel && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">{conversationLabel}</span>}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {isUserOnline ? '🟢 Online' : '⚫ Offline'} {otherUser?.department ? `• ${otherUser.department}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <button onClick={() => handleTogglePin(activeConvId)} className={`p-2 rounded-xl transition-colors ${activeConv?.isPinned ? 'text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-600 hover:bg-gray-50'}`} title="Pin conversation">
                  <Pin className="w-4 h-4" />
                </button>
                {isAlumni && (
                  <button onClick={() => { setShowRightPanel(showRightPanel === 'notes' ? null : 'notes'); }} className={`p-2 rounded-xl transition-colors ${showRightPanel === 'notes' ? 'text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-600 hover:bg-gray-50'}`} title="Private Notes">
                    <Bookmark className="w-4 h-4" />
                  </button>
                )}
                {isAlumni && (
                  <button onClick={() => { setShowRightPanel(showRightPanel === 'goals' ? null : 'goals'); }} className={`p-2 rounded-xl transition-colors ${showRightPanel === 'goals' ? 'text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-600 hover:bg-gray-50'}`} title="Mentorship Goals">
                    <Flag className="w-4 h-4" />
                  </button>
                )}
                {isAlumni && (
                  <button onClick={() => { setShowRightPanel(showRightPanel === 'reminders' ? null : 'reminders'); }} className={`p-2 rounded-xl transition-colors ${showRightPanel === 'reminders' ? 'text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-600 hover:bg-gray-50'}`} title="Follow-up Reminders">
                    <Bell className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => { setShowRightPanel(showRightPanel === 'files' ? null : 'files'); fetchSharedFiles(); }} className={`p-2 rounded-xl transition-colors ${showRightPanel === 'files' ? 'text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-600 hover:bg-gray-50'}`} title="Shared Files">
                  <Share2 className="w-4 h-4" />
                </button>
                <button onClick={() => { setShowRightPanel(showRightPanel === 'starred' ? null : 'starred'); fetchStarred(); }} className={`p-2 rounded-xl transition-colors ${showRightPanel === 'starred' ? 'text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-600 hover:bg-gray-50'}`} title="Starred Messages">
                  <Star className="w-4 h-4" />
                </button>
                <button onClick={() => navigate(`/dashboard/profile?userId=${otherUser?._id}`)} className="p-2 rounded-xl text-gray-500 hover:text-gray-600 hover:bg-gray-50 transition-colors" title="View Profile">
                  <User className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Messages Area */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1 scrollbar-hide">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">No messages yet. Start a conversation!</div>
                  ) : (
                    <>
                      {messages.map((msg, idx) => {
                        const showDate = idx === 0 || formatDate(msg.createdAt) !== formatDate(messages[idx - 1]?.createdAt);
                        return (
                          <React.Fragment key={msg._id}>
                            {showDate && (
                              <div className="flex justify-center my-3">
                                <span className="bg-gray-100 text-gray-500 text-[10px] font-semibold px-3 py-1 rounded-full">{formatDate(msg.createdAt)}</span>
                              </div>
                            )}
                            {renderMessage(msg)}
                          </React.Fragment>
                        );
                      })}
                    </>
                  )}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start mb-3">
                      <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Edit mode indicator */}
                <AnimatePresence>
                  {editingMsg && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="px-4 py-2 bg-yellow-50 border-t border-yellow-100 flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs text-yellow-700 font-medium flex-1">Editing message</span>
                      <button onClick={() => setEditingMsg(null)} className="text-yellow-600 hover:text-yellow-800"><X className="w-4 h-4" /></button>
                      <button onClick={handleEdit} className="text-xs bg-yellow-200 text-yellow-800 px-3 py-1 rounded-lg font-semibold hover:bg-yellow-300">Save</button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="p-3 md:p-4 bg-white/50 border-t border-gray-100 shrink-0">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) { setSelectedFile(f); setShowAttachMenu(false); } }} accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.zip,.txt" />

                  <AnimatePresence>
                    {showAttachMenu && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-4 mb-2 bg-white rounded-2xl border border-gray-100 shadow-xl p-2 flex gap-2 z-10">
                        <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-xl transition-colors w-16 text-blue-500">
                          <ImageIcon className="w-5 h-5" /><span className="text-[10px] font-bold text-gray-600">Image</span>
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-xl transition-colors w-16 text-purple-500">
                          <FileText className="w-5 h-5" /><span className="text-[10px] font-bold text-gray-600">File</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                    <AnimatePresence>
                      {selectedFile && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                            {selectedFile.type.startsWith('image/') ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button onClick={() => setSelectedFile(null)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-end gap-2 p-2">
                      <button onClick={() => setShowAttachMenu(!showAttachMenu)} className={`p-2 rounded-xl transition-colors ${showAttachMenu ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:text-gray-600 hover:bg-gray-50'}`}>
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a message..."
                        className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-2.5 text-sm outline-none"
                        rows={1}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!messageText.trim() && !selectedFile}
                        className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          (messageText.trim() || selectedFile)
                            ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md hover:shadow-lg'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <Send className="w-4 h-4 ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel (Notes / Goals / Reminders / Files / Starred) */}
              <AnimatePresence>
                {showRightPanel && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hidden md:block border-l border-gray-100 bg-white/60 overflow-hidden"
                  >
                    <div className="w-[280px] h-full flex flex-col">
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-sm">
                          {showRightPanel === 'notes' ? 'Private Notes' : showRightPanel === 'goals' ? 'Mentorship Goals' : showRightPanel === 'reminders' ? 'Follow-up Reminders' : showRightPanel === 'files' ? 'Shared Files' : 'Starred Messages'}
                        </h3>
                        <button onClick={() => setShowRightPanel(null)} className="text-gray-500 hover:text-gray-600"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4">
                        {/* ===== PRIVATE NOTES TIMELINE ===== */}
                        {showRightPanel === 'notes' && isAlumni && (
                          <div>
                            <div className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-xl">
                              <input
                                type="text"
                                value={editNoteId ? editNoteTitle : newNoteTitle}
                                onChange={(e) => editNoteId ? setEditNoteTitle(e.target.value) : setNewNoteTitle(e.target.value)}
                                placeholder="Note title..."
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold mb-2 focus:outline-none focus:ring-2 focus:ring-purple-100"
                              />
                              <textarea
                                value={editNoteId ? editNoteContent : newNoteContent}
                                onChange={(e) => editNoteId ? setEditNoteContent(e.target.value) : setNewNoteContent(e.target.value)}
                                placeholder="Write a private note..."
                                className="w-full h-24 bg-white border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-100"
                              />
                              <div className="flex gap-2 mt-2">
                                {editNoteId ? (
                                  <>
                                    <button onClick={() => updateNote(editNoteId, editNoteTitle, editNoteContent)} className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-xs font-semibold">Update</button>
                                    <button onClick={() => setEditNoteId(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold">Cancel</button>
                                  </>
                                ) : (
                                  <button onClick={createNote} className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-xs font-semibold">Add Note</button>
                                )}
                              </div>
                            </div>
                            <div className="space-y-3">
                              {notes.length === 0 ? (
                                <p className="text-xs text-gray-500 text-center py-6">No notes yet</p>
                              ) : (
                                notes.map(note => (
                                  <div key={note._id} className="relative pl-4 border-l-2 border-purple-200 group">
                                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-purple-400"></div>
                                    <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                          {note.title && <p className="text-xs font-bold text-gray-900 truncate">{note.title}</p>}
                                          <p className="text-xs text-gray-700 mt-0.5 whitespace-pre-wrap">{note.content}</p>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                          <button onClick={() => { setEditNoteId(note._id); setEditNoteTitle(note.title || ''); setEditNoteContent(note.content); }} className="text-gray-500 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 className="w-3 h-3" /></button>
                                          <button onClick={() => deleteNote(note._id)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                      </div>
                                      <span className="text-[9px] text-gray-500 mt-1 block">{formatDate(note.createdAt)}</span>
                                      <span className="text-[9px] text-purple-400 mt-0.5 block">Only visible to you</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}

                        {/* ===== MENTORSHIP GOALS ===== */}
                        {showRightPanel === 'goals' && (
                          <div>
                            {isAlumni && (
                              <div className="mb-4">
                                {showGoalForm ? (
                                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                    <input
                                      type="text"
                                      value={newGoalTitle}
                                      onChange={(e) => setNewGoalTitle(e.target.value)}
                                      placeholder="Goal title..."
                                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                    <input
                                      type="date"
                                      value={newGoalDeadline}
                                      onChange={(e) => setNewGoalDeadline(e.target.value)}
                                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                    <div className="flex gap-2">
                                      <button onClick={handleCreateGoal} className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-xs font-semibold">Create</button>
                                      <button onClick={() => setShowGoalForm(false)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold">Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <button onClick={() => setShowGoalForm(true)} className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1"><Plus className="w-3.5 h-3.5" /> New Goal</button>
                                )}
                              </div>
                            )}
                            <div className="space-y-3">
                              {goals.length === 0 ? (
                                <p className="text-xs text-gray-500 text-center py-6">No goals set</p>
                              ) : (
                                goals.map(goal => (
                                  <div key={goal._id} className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-gray-900">{goal.title}</p>
                                        {goal.deadline && <p className="text-[10px] text-gray-500 mt-0.5">Due: {new Date(goal.deadline).toLocaleDateString()}</p>}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                          goal.status === 'completed' ? 'bg-green-100 text-green-700' :
                                          goal.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                          'bg-amber-100 text-amber-700'
                                        }`}>{goal.status}</span>
                                      </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="mt-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] text-gray-500">Progress</span>
                                        <span className="text-[10px] font-semibold text-gray-700">{goal.progress || 0}%</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all" style={{ width: `${goal.progress || 0}%` }}></div>
                                      </div>
                                    </div>
                                    {isAlumni && (
                                      <div className="flex gap-1 mt-2">
                                        <button onClick={() => handleUpdateGoal(goal._id, { progress: Math.min((goal.progress || 0) + 10, 100) })} className="text-[9px] px-2 py-0.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">+10%</button>
                                        <button onClick={() => handleUpdateGoal(goal._id, { status: 'completed' })} className="text-[9px] px-2 py-0.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Complete</button>
                                        <button onClick={() => handleUpdateGoal(goal._id, { status: 'cancelled' })} className="text-[9px] px-2 py-0.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100">Cancel</button>
                                        <button onClick={() => handleDeleteGoal(goal._id)} className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 ml-auto"><Trash2 className="w-3 h-3" /></button>
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}

                        {/* ===== FOLLOW-UP REMINDERS ===== */}
                        {showRightPanel === 'reminders' && (
                          <div>
                            {isAlumni && (
                              <div className="mb-4">
                                {showReminderForm ? (
                                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                    <input
                                      type="text"
                                      value={newReminderTitle}
                                      onChange={(e) => setNewReminderTitle(e.target.value)}
                                      placeholder="Reminder title..."
                                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-amber-100"
                                    />
                                    <input
                                      type="date"
                                      value={newReminderDate}
                                      onChange={(e) => setNewReminderDate(e.target.value)}
                                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-amber-100"
                                    />
                                    <input
                                      type="time"
                                      value={newReminderTime}
                                      onChange={(e) => setNewReminderTime(e.target.value)}
                                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-amber-100"
                                    />
                                    <div className="flex gap-2">
                                      <button onClick={handleCreateReminder} className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-xs font-semibold">Set Reminder</button>
                                      <button onClick={() => setShowReminderForm(false)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold">Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <button onClick={() => setShowReminderForm(true)} className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1"><Plus className="w-3.5 h-3.5" /> New Reminder</button>
                                )}
                              </div>
                            )}
                            <div className="space-y-2">
                              {reminders.length === 0 ? (
                                <p className="text-xs text-gray-500 text-center py-6">No reminders set</p>
                              ) : (
                                reminders.map(rem => (
                                  <div key={rem._id} className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-semibold text-gray-900">{rem.title}</p>
                                      <p className="text-[10px] text-gray-500 mt-0.5">
                                        <Clock className="w-3 h-3 inline mr-0.5" />
                                        {rem.reminderDate ? new Date(rem.reminderDate).toLocaleDateString() : 'No date'}
                                        {rem.reminderTime ? ` ${rem.reminderTime}` : ''}
                                      </p>
                                    </div>
                                    {isAlumni && (
                                      <button onClick={() => handleDeleteReminder(rem._id)} className="text-gray-500 hover:text-red-500 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}

                        {/* ===== SHARED FILES + SEARCH ===== */}
                        {showRightPanel === 'files' && (
                          <div>
                            {isAlumni && (
                              <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Tag className="w-4 h-4 text-purple-500" />
                                  <span className="text-xs font-bold text-gray-500 uppercase">Label</span>
                                  {conversationLabel && (
                                    <button onClick={async () => {
                                      await axios.put(`${API_BASE}/chat/conversations/${activeConvId}/label`, { label: '' }, {
                                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                      });
                                      setConversationLabel('');
                                      fetchConversations();
                                      toast.success('Label removed');
                                    }} className="ml-auto text-[10px] text-red-500 hover:text-red-700 font-semibold">Remove</button>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={showAddLabelInput ? newLabelValue : conversationLabel}
                                    onChange={(e) => {
                                      if (showAddLabelInput) setNewLabelValue(e.target.value);
                                      else setConversationLabel(e.target.value);
                                    }}
                                    placeholder="Type label name..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100"
                                  />
                                  <button onClick={async () => {
                                    const label = showAddLabelInput ? newLabelValue : conversationLabel;
                                    if (!label.trim()) return;
                                    await axios.put(`${API_BASE}/chat/conversations/${activeConvId}/label`, { label: label.trim() }, {
                                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                    });
                                    setConversationLabel(label.trim());
                                    setNewLabelValue('');
                                    setShowAddLabelInput(false);
                                    fetchConversations();
                                    toast.success('Label saved');
                                  }} className="px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold shrink-0">Save</button>
                                </div>
                                {userLabels.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {userLabels.filter(l => l !== conversationLabel).slice(0, 5).map(label => (
                                      <button key={label} onClick={async () => {
                                        await axios.put(`${API_BASE}/chat/conversations/${activeConvId}/label`, { label }, {
                                          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                        });
                                        setConversationLabel(label);
                                        fetchConversations();
                                        toast.success(`Label: ${label}`);
                                      }} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors">{label}</button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            {/* File search */}
                            <div className="relative mb-3">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                              <input
                                type="text"
                                value={filesSearch}
                                onChange={(e) => setFilesSearch(e.target.value)}
                                placeholder="Search files..."
                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-100"
                              />
                            </div>
                            <div className="space-y-2">
                              {sharedFiles.length === 0 ? (
                                <p className="text-xs text-gray-500 text-center py-8">No files shared yet</p>
                              ) : (
                                sharedFiles.filter(f => !filesSearch || (f.fileName || '').toLowerCase().includes(filesSearch.toLowerCase())).map(f => (
                                  <div key={f._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                      {f.messageType === 'image' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-semibold text-gray-900 truncate">{f.fileName || 'File'}</p>
                                      <p className="text-[10px] text-gray-500">{formatDate(f.createdAt)}</p>
                                    </div>
                                    <a href={f.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-500 hover:text-purple-600"><Download className="w-3.5 h-3.5" /></a>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}

                        {/* ===== STARRED MESSAGES + SEARCH ===== */}
                        {showRightPanel === 'starred' && (
                          <div>
                            <div className="relative mb-3">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                              <input
                                type="text"
                                value={starredSearch}
                                onChange={(e) => setStarredSearch(e.target.value)}
                                placeholder="Search starred..."
                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-100"
                              />
                            </div>
                            <div className="space-y-2">
                              {starredMsgs.length === 0 ? (
                                <p className="text-xs text-gray-500 text-center py-8">No starred messages</p>
                              ) : (
                                starredMsgs.filter(s => !starredSearch || (s.message?.content || '').toLowerCase().includes(starredSearch.toLowerCase())).map(s => (
                                  <div key={s._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-800">{s.message?.content || 'No content'}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">{s.message?.sender?.name} • {formatDate(s.createdAt)}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose a conversation from the left panel</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
