# Messaging System - Quick Start Guide

## 🚀 What Was Done

### Backend (Already Set Up ✅)
- Message controller with 6 endpoints
- Routes registered at `/api/messages`
- Authentication middleware
- Database schema with Message model

### Frontend Changes Made

#### 1. **messageAPI.ts** - Removed Mock Data
**Before:**
```typescript
const USE_MOCK = true; // ❌ Using fake data
```

**After:**
```typescript
// ✅ Now connects to real backend
export const messageAPI = {
  send: async (data) => {
    const response = await api.post('/', data);
    return response.data;
  },
  // ... all other methods now hit real API
}
```

#### 2. **Messages.tsx** - Enhanced with Real Features
**Added:**
- ✅ Real-time polling (5-second intervals)
- ✅ Error handling and display
- ✅ Loading states with spinners
- ✅ Sending state (prevents double-send)
- ✅ Optimistic UI updates
- ✅ Support for starting new conversations
- ✅ Better empty states

#### 3. **CandidateSearch.tsx** - Added Message Button
**Added:**
- ✅ "Message" button next to "Email" button
- ✅ Navigates to Messages page with user context
- ✅ Automatically starts new conversation

## 🎯 How to Use

### For Recruiters:

#### Starting a Conversation with a Candidate
1. Go to **Candidate Search** page
2. Find a candidate you want to message
3. Click the **"Message"** button (blue, with chat icon)
4. You'll be taken to Messages page
5. Type your message and press **Send** or **Enter**

#### Checking Messages
1. Go to **Messages** page from navigation
2. See all conversations on the left sidebar
3. Unread messages show a blue badge with count
4. Click any conversation to view messages
5. Messages are automatically marked as read

### For Candidates:

#### Receiving Messages
1. When a recruiter messages you, you'll get a notification
2. Go to **Messages** page
3. Click the conversation to view messages
4. Reply by typing and pressing Send

#### Application Status Updates
- When a recruiter updates your application status
- You'll receive an **automated message**
- Shows with a **purple "⚡ Status Update"** badge
- Has a special gradient background

## 📋 Testing Steps

### Step 1: Make Sure Backend is Running
```bash
cd backend
npm run dev
```
Should show: `Server running on http://localhost:5001`

### Step 2: Make Sure Frontend is Running
```bash
cd frontend
npm run dev
```
Should show: `Local: http://localhost:5173`

### Step 3: Test Sending Messages

#### As Recruiter:
1. Login as recruiter
2. Go to Candidate Search
3. Click "Message" on any candidate
4. Type: "Hello! I'd like to discuss your application."
5. Press Enter or click Send
6. ✅ Message should appear immediately

#### As Candidate:
1. Login as that candidate (in different browser/incognito)
2. Go to Messages
3. ✅ Should see the conversation with unread count
4. Click the conversation
5. ✅ Should see the recruiter's message
6. ✅ Unread badge should disappear
7. Reply: "Thank you! I'm interested."
8. ✅ Reply should appear

### Step 4: Test Automated Messages
1. As recruiter, go to Applications
2. Click any application
3. Change status to "SHORTLISTED"
4. Add note: "Moving to next round"
5. Click "Update Application"
6. ✅ Check Messages - automated message sent
7. ✅ Should have purple "Status Update" badge

## 🔍 Troubleshooting

### Problem: Messages not loading
**Check:**
```bash
# 1. Is backend running?
curl http://localhost:5001/api/messages/conversations
# Should return 401 (needs auth) or 200 with data

# 2. Check browser console (F12)
# Should see errors if API fails

# 3. Check backend terminal
# Should show incoming requests
```

**Solution:**
- Make sure both servers are running
- Check if you're logged in (token valid)
- Verify `.env` has correct API URL

### Problem: "Failed to fetch conversations"
**Check:**
```typescript
// frontend/.env
VITE_API_URL=http://localhost:5001/api
```

**Solution:**
- Create `.env` file if missing
- Restart frontend server after adding

### Problem: Conversations list is empty
**Reason:** No messages sent yet!

**Solution:**
1. Send your first message from Candidate Search
2. Or update an application status to trigger automated message
3. Refresh Messages page

### Problem: Can't send messages
**Check:**
1. Are you logged in? (Check localStorage has 'token')
2. Does the receiver user exist?
3. Check browser Network tab (F12) for errors

## 📱 Features Available

### ✅ Implemented
- [x] Send messages between users
- [x] Conversation list with latest message
- [x] Unread message counts
- [x] Auto-mark as read when viewed
- [x] Real-time polling (5s intervals)
- [x] Application-linked messages
- [x] Automated status update messages
- [x] Purple badge for automated messages
- [x] Message templates
- [x] Code snippet sharing
- [x] Dark mode support
- [x] Error handling
- [x] Loading states
- [x] Start conversation from other pages
- [x] Responsive design

### 🔮 Future Enhancements
- [ ] WebSocket for instant delivery
- [ ] File attachments
- [ ] Image/video sharing
- [ ] Message search
- [ ] Message reactions
- [ ] Typing indicators
- [ ] Online/offline status
- [ ] Message editing
- [ ] Message deletion
- [ ] Push notifications

## 📊 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/messages` | Send a message |
| GET | `/api/messages/conversations` | Get all conversations |
| GET | `/api/messages/:userId` | Get conversation with user |
| GET | `/api/messages/application/:id` | Get application messages |
| PUT | `/api/messages/:id/read` | Mark message as read |
| GET | `/api/messages/unread-count` | Get unread count |

## 🎨 UI Components

### Conversation List
- Shows all conversations
- Latest message preview
- Unread count badge (blue)
- Active conversation highlighted

### Message Bubble
- Sender name and timestamp
- Message content
- Read/Sent status
- Special styling for automated messages:
  - Purple badge: "⚡ Status Update"
  - Gradient background
  - Border highlight

### Message Input
- Textarea with auto-resize
- Send button with loading state
- Enter to send (Shift+Enter for new line)
- Message templates button
- Code snippet button

## 💡 Tips

### For Best Experience:
1. Keep both browser tabs open (recruiter + candidate)
2. Messages refresh every 5 seconds automatically
3. Use message templates for common responses
4. Application-linked messages help organize communication

### Keyboard Shortcuts:
- **Enter** - Send message
- **Shift+Enter** - New line
- **Esc** - Clear error message

## 🔗 Related Files

```
Backend:
├── src/controllers/message.controller.ts  (6 endpoints)
├── src/routes/message.routes.ts          (Route definitions)
└── prisma/schema.prisma                  (Message model)

Frontend:
├── src/services/messageAPI.ts            (API client)
├── src/pages/Messages.tsx                (Main UI)
├── src/pages/CandidateSearch.tsx         (Start conversation)
├── src/components/MessageBubble.tsx      (Message display)
├── src/components/MessageTemplates.tsx   (Templates)
└── src/components/CodeSnippetShare.tsx   (Code sharing)

Documentation:
├── MESSAGING_SYSTEM_GUIDE.md             (Full API docs)
├── MESSAGING_FLOW_DIAGRAM.md             (Architecture)
└── MESSAGING_QUICKSTART.md               (This file)
```

## 🆘 Need Help?

1. **Check console logs** (Browser F12 and Backend terminal)
2. **Review the flow diagram** (MESSAGING_FLOW_DIAGRAM.md)
3. **Read full API docs** (MESSAGING_SYSTEM_GUIDE.md)
4. **Verify database** is up to date: `npx prisma migrate dev`

## ✨ Success Indicators

You'll know it's working when:
- ✅ Conversations list loads
- ✅ Messages appear after sending
- ✅ Unread counts update
- ✅ Messages marked as read when viewed
- ✅ Automated messages show purple badge
- ✅ No console errors
- ✅ Both users can see messages

---

**Integration Complete! 🎉**

The messaging system is now fully connected to your backend and ready to use!
