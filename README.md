SigmaGPT

A full-stack, ChatGPT-style AI chat application built with the MERN stack, featuring secure authentication, real-time-feeling AI responses, voice interaction, and per-user data isolation.

Tech Stack

Frontend: React (Vite), Context API for state management, React Markdown + rehype-highlight for rendering AI responses with syntax-highlighted code blocks

Backend: Node.js, Express.js

Database: MongoDB (via Mongoose)

AI Provider: Groq API (Llama 3.1 8B Instant model)

Auth: JSON Web Tokens (JWT) + bcrypt for password hashing

Features
Authentication — Signup/login with JWT sessions, bcrypt-hashed passwords, and full validation (required fields, email format, password length, duplicate email/username prevention)
Persistent per-user chat history — Each user's threads are isolated at the database level via a userId field; auth middleware verifies the requesting user still exists on every protected request
Voice input & output — Speech-to-text (Web Speech API SpeechRecognition) fills the prompt box by voice; text-to-speech (SpeechSynthesisUtterance) reads the latest AI reply aloud
Message editing — Editing a past user message truncates the conversation from that point forward and triggers a fresh AI response
Copy to clipboard — One-click copy on the latest AI reply with visual confirmation
Animated, responsive UI — Custom-built dark theme with entrance animations, hover states, and a typing-indicator while waiting on a reply
Session security — Auto-logout on token expiry or invalid/deleted-user tokens (401 handling)
Architecture
High-level flow
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │  HTTP   │   Express    │  HTTP   │   Groq API  │
│  Frontend   │ ──────► │   Backend    │ ──────► │  (LLM)      │
│             │ ◄────── │              │ ◄────── │             │
└─────────────┘         └──────┬───────┘         └─────────────┘
                                │
                                ▼
                         ┌─────────────┐
                         │  MongoDB    │
                         │ (Users,     │
                         │  Threads)   │
                         └─────────────┘
Authentication flow
User signs up → password is hashed with bcrypt → user document saved → JWT issued (7-day expiry) → token stored in localStorage
On every protected request, the auth middleware verifies the JWT signature and confirms the user still exists in the database — this means a deleted user's old token is immediately rejected, not just expired tokens
On the frontend, a 401 response anywhere triggers an automatic logout and redirect to the login screen
Chat flow
User sends a message → frontend calls POST /api/chat with the message and a threadId
Backend finds or creates the thread (scoped to req.user.userId), appends the user's message, and calls the Groq API
The AI's reply is saved to the thread in MongoDB and returned to the frontend
Frontend displays the reply with a word-by-word typing animation
State management (React Context)

All shared state (current prompt, chat history, thread list, auth status, etc.) lives in a single MyContext provider at the app root. This was a deliberate architectural decision — for example, the message-edit feature needed to trigger the same "send message" logic that lives in a different component than the edit UI itself. Rather than duplicating that logic, a shared triggerReply counter in context lets one component (Chat.jsx) signal another (ChatWindow.jsx) to fire a new request — a lightweight pattern for cross-component communication without prop drilling.

Data isolation

Every thread document has a userId field. All read/write operations on threads (GET /api/thread, GET /api/thread/:id, DELETE /api/thread/:id, POST /api/chat) filter by the authenticated user's ID, so one user can never see or modify another user's conversations — even if they guess a valid threadId.

Project Structure
SigmaGPT/
├── backend/
│   ├── models/
│   │   ├── user.js          # User schema
│   │   └── thread.js        # Thread + Message schema
│   ├── routes/
│   │   ├── auth.js          # /signup, /login
│   │   └── chat.js          # /chat, /thread routes
│   ├── utils/
│   │   └── grok.js          # Groq API integration
│   ├── middleware.js        # JWT auth middleware
│   └── server.js            # Express app entry point
└── frontend/
    └── src/
        ├── App.jsx           # Root component, Context provider
        ├── ChatWindow.jsx    # Main chat UI, message sending logic
        ├── Chat.jsx          # Message list, edit/copy/voice actions
        ├── Sidebar.jsx       # Thread history, new chat
        ├── Login.jsx / Signup.jsx
        └── MyContext.jsx     # Shared app state
Key Learnings
Debugging real race conditions and state-timing issues (React batching, useRef vs useState for values that shouldn't trigger re-renders)
CSS specificity conflicts between global and scoped rules
Attempted and later reverted a Server-Sent-Events streaming implementation after running into abort-handling and timing complexity — a deliberate simplification once the added complexity outweighed the benefit for this project's scope
Designing multi-tenant data isolation from the ground up rather than bolting it on afterward
Running Locally
bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

Environment variables needed (backend .env):

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
