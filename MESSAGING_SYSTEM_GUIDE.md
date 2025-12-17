# Messaging System Integration Guide

## Overview
The messaging system allows recruiters and candidates to communicate directly within the platform. Messages can be sent between users and can be associated with specific job applications.

## Backend API Endpoints

All message endpoints require authentication via JWT token in the Authorization header.

### Base URL
```
http://localhost:5001/api/messages
```

### Available Endpoints

#### 1. Send a Message
**POST** `/api/messages`

Send a message to another user.

**Request Body:**
```json
{
  "receiverId": "user-id",
  "content": "Your message here",
  "applicationId": "optional-application-id",
  "attachments": ["optional-array-of-attachment-urls"]
}
```

**Response:**
```json
{
  "id": "message-id",
  "content": "Your message here",
  "status": "SENT",
  "senderId": "sender-id",
  "receiverId": "receiver-id",
  "applicationId": "application-id",
  "attachments": [],
  "createdAt": "2025-12-17T...",
  "updatedAt": "2025-12-17T...",
  "sender": {
    "id": "sender-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "CANDIDATE"
  },
  "receiver": {
    "id": "receiver-id",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "role": "RECRUITER"
  }
}
```

#### 2. Get All Conversations
**GET** `/api/messages/conversations`

Get all conversations for the current user with the latest message and unread count.

**Response:**
```json
[
  {
    "user": {
      "id": "user-id",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "role": "RECRUITER"
    },
    "lastMessage": {
      "id": "message-id",
      "content": "Latest message",
      "status": "READ",
      "createdAt": "2025-12-17T..."
    },
    "unreadCount": 2
  }
]
```

#### 3. Get Conversation with Specific User
**GET** `/api/messages/:userId`

Get all messages exchanged with a specific user. Messages are automatically marked as read.

**Response:**
```json
[
  {
    "id": "message-id",
    "content": "Message content",
    "status": "READ",
    "senderId": "sender-id",
    "receiverId": "receiver-id",
    "createdAt": "2025-12-17T...",
    "sender": {
      "id": "sender-id",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
]
```

#### 4. Get Messages for an Application
**GET** `/api/messages/application/:applicationId`

Get all messages related to a specific job application.

**Response:** Same as conversation messages

#### 5. Mark Message as Read
**PUT** `/api/messages/:id/read`

Mark a specific message as read. Only the receiver can mark messages as read.

**Response:**
```json
{
  "id": "message-id",
  "status": "READ",
  ...
}
```

#### 6. Get Unread Message Count
**GET** `/api/messages/unread-count`

Get the total count of unread messages for the current user.

**Response:**
```json
{
  "count": 5
}
```

## Frontend Integration

### Message API Service
Located at: `frontend/src/services/messageAPI.ts`

#### Usage Examples:

```typescript
import { messageAPI } from '../services/messageAPI';

// Send a message
const message = await messageAPI.send({
  receiverId: 'user-id',
  content: 'Hello!',
  applicationId: 'optional-app-id'
});

// Get all conversations
const conversations = await messageAPI.getConversations();

// Get conversation with a user
const messages = await messageAPI.getConversation('user-id');

// Get messages for an application
const appMessages = await messageAPI.getApplicationMessages('app-id');

// Mark as read
await messageAPI.markAsRead('message-id');

// Get unread count
const count = await messageAPI.getUnreadCount();
```

### Messages Page Component
Located at: `frontend/src/pages/Messages.tsx`

**Features:**
- Real-time message polling (every 5 seconds)
- Conversation list with unread counts
- Message history display
- Send new messages
- Message templates integration
- Code snippet sharing
- Dark mode support
- Error handling and loading states

### Starting a New Conversation

From any page, you can navigate to messages and start a conversation:

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Start conversation with a user
navigate('/messages', { 
  state: { 
    startConversation: {
      id: 'user-id',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'CANDIDATE'
    }
  } 
});
```

**Example in CandidateSearch page:**
```tsx
<button
  onClick={() => navigate('/messages', { 
    state: { startConversation: candidate.user } 
  })}
>
  Message Candidate
</button>
```

## Database Schema

### Message Model
```prisma
model Message {
  id            String   @id @default(uuid())
  content       String
  status        MessageStatus @default(SENT)
  attachments   String[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  sender        User     @relation("SentMessages", fields: [senderId], references: [id])
  senderId      String
  
  receiver      User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
  receiverId    String
  
  application   Application? @relation(fields: [applicationId], references: [id])
  applicationId String?
}

enum MessageStatus {
  SENT
  DELIVERED
  READ
}
```

## Features

### 1. Direct Messaging
- Users can send messages to each other
- Messages are marked as read when viewed
- Real-time unread count updates

### 2. Application-Linked Messages
- Messages can be linked to specific job applications
- Helps organize communication around job applications
- Special badge shown for automated status update messages

### 3. Automated Status Messages
When recruiters update an application status, an automated message is sent to the candidate:
- Purple "Status Update" badge with lightning icon
- Gradient background styling
- Includes optional recruiter notes

### 4. Message Templates
Pre-defined templates for common scenarios:
- Interview invitation
- Application received
- Application rejected (with encouragement)
- Request for additional information

### 5. Code Snippet Sharing
For technical discussions and assessments

## Security & Permissions

### Access Control
- Users can only send messages to users they have interactions with
- For application-linked messages, user must be either:
  - The candidate who applied
  - The recruiter who posted the job

### Authentication
All endpoints require valid JWT authentication token:
```typescript
headers: {
  'Authorization': 'Bearer <token>'
}
```

## Testing the Integration

### 1. Start Backend Server
```bash
cd backend
npm run dev
```

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```

### 3. Test Flow

1. **Login as Recruiter**
   - Go to Candidate Search page
   - Click "Message" button on any candidate card
   - You'll be redirected to Messages page
   - Type a message and send

2. **Login as Candidate**
   - Navigate to Messages page
   - You should see the conversation
   - Send a reply

3. **Check Features**
   - Verify unread count updates
   - Check messages are marked as read when viewed
   - Test message templates
   - Update application status and check automated message

## Troubleshooting

### Messages not loading
- Check if backend server is running on port 5001
- Verify JWT token is valid and not expired
- Check browser console for errors
- Verify API URL in `.env` file: `VITE_API_URL=http://localhost:5001/api`

### Messages not sending
- Check network tab in browser dev tools
- Verify receiverId is valid
- Check backend console for errors
- Ensure user has permission to message the recipient

### Real-time updates not working
- The system uses polling every 5 seconds
- For true real-time, consider implementing WebSocket
- Check if polling interval is running (browser console)

## Future Enhancements

1. **WebSocket Integration**
   - Real-time message delivery
   - Typing indicators
   - Online/offline status

2. **File Attachments**
   - Upload and share files
   - Image preview
   - Document viewer

3. **Message Search**
   - Search within conversations
   - Filter by date, sender, etc.

4. **Message Reactions**
   - Emoji reactions
   - Message threading

5. **Group Conversations**
   - Multiple participants
   - Group chat for team interviews

6. **Push Notifications**
   - Browser notifications
   - Email notifications for offline users

## Support

For issues or questions:
1. Check backend logs: `backend/logs/`
2. Check browser console for frontend errors
3. Verify database schema is up to date: `npx prisma migrate dev`
4. Review this documentation

---

**Last Updated:** December 17, 2025
