import React, { useState, useEffect, useRef } from 'react';
import { websocketService } from '../utils/websocketService';
import PresenceIndicator from './PresenceIndicator';
import TypingIndicator from './TypingIndicator';

export interface Comment {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  reactions?: { emoji: string; userIds: string[]; }[];
  isEdited: boolean;
}

interface TeamDiscussionProps {
  threadId: string; // Could be applicationId, candidateId, etc.
  threadType: 'application' | 'candidate' | 'job';
  currentUserId: string;
  currentUserName: string;
}

const TeamDiscussion: React.FC<TeamDiscussionProps> = ({
  threadId,
  threadType,
  currentUserId,
  currentUserName,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComments();

    // Subscribe to real-time comment updates
    const unsubscribe = websocketService.on('comment', (data) => {
      if (data.threadId === threadId) {
        handleCommentUpdate(data);
      }
    });

    return unsubscribe;
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/comments/${threadType}/${threadId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
        })));
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
    setLoading(false);
  };

  const handleCommentUpdate = (data: any) => {
    if (data.action === 'create') {
      setComments(prev => [...prev, {
        ...data.comment,
        createdAt: new Date(data.comment.createdAt),
      }]);
    } else if (data.action === 'delete') {
      setComments(prev => prev.filter(c => c.id !== data.commentId));
    } else if (data.action === 'reaction') {
      setComments(prev => prev.map(c =>
        c.id === data.commentId
          ? { ...c, reactions: data.reactions }
          : c
      ));
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      websocketService.sendTypingIndicator(threadId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      websocketService.sendTypingIndicator(threadId, false);
    }, 2000);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    const content = newComment;
    setNewComment('');
    setIsTyping(false);
    websocketService.sendTypingIndicator(threadId, false);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          threadId,
          threadType,
          content,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Notify via WebSocket
        websocketService.send('comment', {
          action: 'create',
          threadId,
          comment: {
            id: data.commentId,
            threadId,
            authorId: currentUserId,
            authorName: currentUserName,
            content,
            createdAt: new Date(),
            reactions: [],
            isEdited: false,
          },
        });
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleReaction = async (commentId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ emoji }),
      });

      if (response.ok) {
        const data = await response.json();

        // Notify via WebSocket
        websocketService.send('comment', {
          action: 'reaction',
          threadId,
          commentId,
          reactions: data.reactions,
        });
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        websocketService.send('comment', {
          action: 'delete',
          threadId,
          commentId,
        });
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const reactionEmojis = ['👍', '❤️', '😊', '🎉', '🚀', '👀'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex flex-col" style={{ height: '600px' }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Team Discussion
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </p>
      </div>

      {/* Comments */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="group">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {comment.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1">
                  <PresenceIndicator userId={comment.authorId} size="sm" />
                </div>
              </div>

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(comment.createdAt)}
                    {comment.isEdited && ' (edited)'}
                  </span>
                </div>

                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-2">
                  <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>

                {/* Reactions */}
                <div className="flex items-center gap-2">
                  {comment.reactions && comment.reactions.length > 0 && (
                    <div className="flex gap-1">
                      {comment.reactions.map((reaction, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleReaction(comment.id, reaction.emoji)}
                          className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                            reaction.userIds.includes(currentUserId)
                              ? 'bg-primary-100 dark:bg-primary-900 border border-primary-300 dark:border-primary-700'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-gray-600 dark:text-gray-400">{reaction.userIds.length}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reaction Picker */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {reactionEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(comment.id, emoji)}
                        className="w-6 h-6 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-sm"
                        title={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Delete */}
                  {comment.authorId === currentUserId && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        <TypingIndicator conversationId={threadId} />

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
            placeholder="Add a comment... (Shift+Enter for new line)"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
            rows={2}
          />
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamDiscussion;
