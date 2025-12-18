import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface MessageBubbleProps {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  isOwn: boolean;
  attachments?: string[];
  applicationId?: string;
  onReply?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  id,
  content,
  senderName,
  timestamp,
  status,
  isOwn,
  attachments = [],
  applicationId,
  onReply,
  onDelete,
}) => {
  const [showActions, setShowActions] = React.useState(false);

  // Detect if this is an automated status update message
  const isAutomatedMessage = applicationId && (content.includes('Congratulations') ||
    content.includes('shortlisted') ||
    content.includes('under consideration') ||
    content.includes('status has been updated') ||
    content.includes('offer letter') ||
    content.includes('Thank you for your interest'));

  // Parse code snippets from message content
  const parseCodeSnippets = (text: string) => {
    const codeBlockRegex = /```(\w +) ?\n([\s\S] *?)```/g;
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        content: match[2].trim(),
        language: match[1] || 'text',
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text' as const, content: text }];
  };

  const parsedContent = parseCodeSnippets(content);
  const formattedTime = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusIcon = () => {
    if (!isOwn) return null;

    switch (status) {
      case 'SENT':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <title>Sent</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'DELIVERED':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <title>Delivered</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 13l4 4L19 7" transform="translate(2, 0)" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'READ':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <title>Read</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 13l4 4L19 7" transform="translate(2, 0)" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Could add a toast notification here
  };

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className="flex items-center gap-2 mb-1">
          {!isOwn && (
            <span className="text-xs text-gray-600 dark:text-gray-400 px-2">
              {senderName}
            </span>
          )}
          {isAutomatedMessage && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full border border-purple-200 dark:border-purple-800">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Status Update
            </span>
          )}
        </div>

        <div
          className={`rounded-2xl px-4 py-2 ${isOwn
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : isAutomatedMessage
                ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-800 text-slate-800 dark:text-white shadow-md'
                : 'bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white shadow-sm'
            } relative`}
        >
          {/* Message Actions */}
          {showActions && (
            <div className={`absolute top - 0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} flex items - center gap - 1 px - 2`}>
              {onReply && (
                <button
                  onClick={() => onReply(id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Reply"
                  aria-label="Reply to message"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
              )}
              {isOwn && onDelete && (
                <button
                  onClick={() => onDelete(id)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                  title="Delete"
                  aria-label="Delete message"
                >
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Message Content */}
          {parsedContent.map((part, index) => (
            <div key={index}>
              {part.type === 'text' ? (
                <p className="whitespace-pre-wrap break-words">{part.content}</p>
              ) : (
                <div className="my-2 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 dark:bg-gray-900 px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-300 font-mono">{part.language}</span>
                    <button
                      onClick={() => copyCode(part.content)}
                      className="text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={part.language}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      fontSize: '0.875rem',
                    }}
                    showLineNumbers
                  >
                    {part.content}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>
          ))}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachments.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items - center gap - 2 text - sm ${isOwn ? 'text-white hover:underline' : 'text-primary-600 dark:text-primary-400 hover:underline'
                    } `}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Attachment {idx + 1}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp and Status */}
        <div className={`flex items - center gap - 1 mt - 1 px - 2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} `}>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formattedTime}
          </span>
          {isOwn && getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
