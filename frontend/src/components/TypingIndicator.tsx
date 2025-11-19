import React, { useEffect, useState } from 'react';
import { websocketService, TypingIndicator as TypingIndicatorType } from '../utils/websocketService';

interface TypingIndicatorProps {
  conversationId: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ conversationId }) => {
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Subscribe to typing events
    const unsubscribe = websocketService.on('typing', (data: TypingIndicatorType) => {
      if (data.conversationId !== conversationId) return;

      setTypingUsers(prev => {
        const updated = new Map(prev);
        if (data.isTyping) {
          updated.set(data.userId, data.userName);
        } else {
          updated.delete(data.userId);
        }
        return updated;
      });

      // Auto-remove typing indicator after 5 seconds
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => {
            const updated = new Map(prev);
            updated.delete(data.userId);
            return updated;
          });
        }, 5000);
      }
    });

    return unsubscribe;
  }, [conversationId]);

  if (typingUsers.size === 0) {
    return null;
  }

  const userNames = Array.from(typingUsers.values());
  const displayText =
    userNames.length === 1
      ? `${userNames[0]} is typing`
      : userNames.length === 2
      ? `${userNames[0]} and ${userNames[1]} are typing`
      : `${userNames[0]} and ${userNames.length - 1} others are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{displayText}</span>
    </div>
  );
};

export default TypingIndicator;
