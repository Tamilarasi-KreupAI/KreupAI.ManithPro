# Message System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MESSAGING SYSTEM ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐                              ┌──────────────────────┐
│   FRONTEND PAGES     │                              │   BACKEND ROUTES     │
└──────────────────────┘                              └──────────────────────┘
         │                                                       │
         │                                                       │
         ├─── CandidateSearch.tsx ───────────────────┐          │
         │    • "Message" button                     │          │
         │    • Navigates with user data             │          │
         │                                           │          │
         ├─── Messages.tsx ──────────────────────────┼──────────┤
         │    • Conversations list                   │          │
         │    • Message history                      │          │
         │    • Send new messages                    │          │
         │    • Real-time polling (5s)               │          │
         │    • Error handling                       │          │
         │                                           │          │
         └─── ApplicationDetail.tsx ─────────────────┘          │
              • Automated status messages                       │
              • Purple badge for updates                        │
                                                                │
                          ↓                                     ↓
                                                                
┌──────────────────────┐                              ┌──────────────────────┐
│  MESSAGE API SERVICE │                              │  MESSAGE CONTROLLER  │
└──────────────────────┘                              └──────────────────────┘
         │                                                       │
    messageAPI.ts                                                │
         │                                                       │
         ├─ send(data) ────────────────────────────────────────→ POST /
         │                                                       │
         ├─ getConversations() ────────────────────────────────→ GET /conversations
         │                                                       │
         ├─ getConversation(userId) ───────────────────────────→ GET /:userId
         │                                                       │
         ├─ getApplicationMessages(appId) ─────────────────────→ GET /application/:id
         │                                                       │
         ├─ markAsRead(id) ────────────────────────────────────→ PUT /:id/read
         │                                                       │
         └─ getUnreadCount() ──────────────────────────────────→ GET /unread-count
                                                                │
                                                                ↓
                                                                
                                                    ┌──────────────────────┐
                                                    │   PRISMA DATABASE    │
                                                    └──────────────────────┘
                                                                │
                                                      Message Model:
                                                      • id
                                                      • content
                                                      • status (SENT/READ)
                                                      • attachments
                                                      • senderId
                                                      • receiverId
                                                      • applicationId
                                                      • createdAt
                                                      • updatedAt
```

## Data Flow Examples

### 1. Sending a Message

```
User Types Message → Click Send Button
         ↓
Messages.tsx: handleSendMessage()
         ↓
messageAPI.send({ receiverId, content })
         ↓
POST /api/messages
         ↓
Backend validates sender & receiver
         ↓
Create Message in Database
         ↓
Create Notification for receiver
         ↓
Return Message with sender/receiver data
         ↓
Frontend updates UI optimistically
         ↓
Refresh conversations list
```

### 2. Loading Conversations

```
User Opens Messages Page
         ↓
Messages.tsx: useEffect() → fetchConversations()
         ↓
messageAPI.getConversations()
         ↓
GET /api/messages/conversations
         ↓
Backend finds all messages involving user
         ↓
Groups by conversation partner
         ↓
Returns: [{ user, lastMessage, unreadCount }]
         ↓
Frontend displays conversation list
         ↓
Starts 5-second polling interval
```

### 3. Starting New Conversation

```
Recruiter on CandidateSearch Page
         ↓
Clicks "Message" button on candidate card
         ↓
navigate('/messages', { state: { startConversation: candidate.user } })
         ↓
Messages.tsx receives location.state
         ↓
Checks if conversation exists
         ↓
If exists: Select existing conversation
If new: Create temporary conversation object
         ↓
Clear location.state
         ↓
User can now send first message
```

### 4. Automated Status Messages

```
Recruiter updates Application Status
         ↓
ApplicationDetail.tsx: handleStatusUpdate()
         ↓
Backend: updateApplicationStatus()
         ↓
Update application status in DB
         ↓
Create automated message:
  - content: Status-specific template
  - senderId: Recruiter
  - receiverId: Candidate
  - applicationId: Application ID
         ↓
Create notification for candidate
         ↓
Return updated application
         ↓
Frontend: Messages page shows purple "Status Update" badge
```

## Component Relationships

```
App.tsx
  └── Messages.tsx
        ├── Uses: messageAPI service
        ├── Uses: useAuth() for current user
        ├── Uses: useLocation() for navigation state
        │
        ├── Renders: Conversations List
        │     └── Shows: user name, last message, unread count
        │
        └── Renders: Message Area
              ├── MessageBubble (for each message)
              │     └── Shows: content, sender, timestamp, status
              │           └── Special styling for automated messages
              │
              ├── MessageTemplates
              │     └── Pre-filled message templates
              │
              ├── CodeSnippetShare
              │     └── Insert code snippets
              │
              └── Message Input
                    └── Textarea + Send button
```

## State Management

```typescript
// Messages.tsx State
{
  conversations: Conversation[],      // All conversations
  selectedConversation: Conversation, // Currently active
  messages: Message[],                // Messages in conversation
  newMessage: string,                 // Draft message
  loading: boolean,                   // Initial load
  sending: boolean,                   // Sending state
  error: string | null                // Error message
}

// Polling Logic
setInterval(() => {
  if (selectedConversation) {
    fetchMessages(selectedConversation.user.id, silent: true)
  }
  fetchConversations()
}, 5000)
```

## API Response Examples

### Send Message Response
```json
{
  "id": "msg-123",
  "content": "Hello, I'm interested in the position",
  "status": "SENT",
  "senderId": "user-456",
  "receiverId": "user-789",
  "applicationId": "app-012",
  "attachments": [],
  "createdAt": "2025-12-17T10:30:00Z",
  "sender": {
    "id": "user-456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "CANDIDATE"
  },
  "receiver": {
    "id": "user-789",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "role": "RECRUITER"
  }
}
```

### Get Conversations Response
```json
[
  {
    "user": {
      "id": "user-789",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "role": "RECRUITER"
    },
    "lastMessage": {
      "id": "msg-125",
      "content": "Thank you for your application",
      "status": "READ",
      "createdAt": "2025-12-17T11:00:00Z"
    },
    "unreadCount": 0
  }
]
```

## Error Handling

```typescript
// All API calls include try-catch
try {
  const response = await api.post('/', data);
  return response.data;
} catch (error: any) {
  console.error('Error:', error.response?.data || error.message);
  throw new Error(error.response?.data?.error || 'Failed to send message');
}

// Frontend displays errors
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-red-600">{error}</p>
  </div>
)}
```

## Key Features Implemented

✅ Real-time polling (5-second intervals)
✅ Unread message counts
✅ Auto-mark as read when viewing
✅ Conversation grouping
✅ Application-linked messages
✅ Automated status messages with special styling
✅ Message templates
✅ Code snippet sharing
✅ Dark mode support
✅ Error handling and loading states
✅ Start new conversations from other pages
✅ Responsive design
✅ Optimistic UI updates

## Testing Checklist

□ Send message between users
□ Receive message and see unread count
□ Open conversation marks messages as read
□ Conversations update with latest message
□ Start conversation from CandidateSearch
□ Application status update sends automated message
□ Purple badge shows for automated messages
□ Message templates work
□ Dark mode styling correct
□ Error messages display properly
□ Loading states show
□ Polling updates messages automatically
