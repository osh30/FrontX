# FRONX Backend Architecture & Database Standards

## 1. Introduction
The FRONX backend is designed as a production-grade RESTful API powered by Node.js, Express, and MongoDB. It manages all platform activities including authentication, community interactions, mentorship, research collaboration, AI skill analysis, and real-time messaging.

## 2. Folder Structure
The backend adheres to a clean, modular MVC (Model-View-Controller) structure:
```
backend/
├── config/        # Database and third-party API configurations (e.g., db.js)
├── controllers/   # Business logic for all routes
├── docs/          # Backend documentation and architecture standards
├── middleware/    # Authentication (JWT), file upload (Multer), and error handling
├── models/        # Mongoose Schemas (Database definitions)
├── routes/        # API route definitions
├── server.js      # Entry point, Express app setup, and Socket.io initialization
```

## 3. MongoDB Collections & Models
All documents leverage `{ timestamps: true }` (providing `createdAt` and `updatedAt`).
Data is strictly committed to MongoDB. No temporary frontend state or hardcoded arrays are used for core features.

### Core Models:
- **User**: Stores profiles for Students and Alumni, including hashed passwords, bio, skills, education, and UI preferences.
- **CommunityPost / AnonymousPost**: Stores community feeds, supporting image uploads, likes, and nested comments.
- **MentorshipRequest / MentorshipSession**: Manages the lifecycle of mentorship connections and scheduled 1-on-1 sessions.
- **CollaborationPost / CollaborationApplication**: Manages research projects and student applications.
- **Resource / ClassNote**: Manages uploaded files (PDF, PPT) and external learning links.
- **Job**: Manages career and internship postings.
- **SkillAnalysis**: Stores AI-generated CV evaluations, skill gaps, and learning roadmaps.
- **Conversation / Message**: Stores 1-on-1 and group chat histories permanently.
- **Notification**: Stores all alerts (Mentorship, Research, Community) for persistent retrieval.
- **Activity**: Stores global platform activities (for the scrolling ticker on the landing page).

## 4. Relationships (References)
MongoDB `ObjectId` references are strictly utilized to avoid data duplication.
- **Community**: `User` -> `CommunityPost` -> `Comment` -> `Like`
- **Mentorship**: `Student (User)` -> `MentorshipRequest` <- `Alumni (User)`
- **Chat**: `User` -> `Conversation` -> `Message`
- **Research**: `Alumni (User)` -> `CollaborationPost` -> `CollaborationApplication` <- `Student (User)`

## 5. API Endpoints Structure
All APIs use standardized REST patterns and return consistent JSON structures.

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`
- **Users**: `/api/users`, `/api/alumni` (Role-based filtering)
- **Community**: `/api/community-posts`, `/api/anonymous-posts`
- **Mentorship**: `/api/mentorship`, `/api/mentorship-sessions`
- **Research**: `/api/collaborations`
- **Careers**: `/api/jobs`
- **Resources**: `/api/resources`, `/api/learning`, `/api/notes`
- **AI Analysis**: `/api/ai/analyze-cv`
- **Messaging**: `/api/chat/conversations`, `/api/chat/messages`
- **Notifications**: `/api/notifications`
- **Global Activity**: `/api/activities/global`

## 6. Authentication Flow
1. User registers/logs in via `/api/auth`.
2. Backend verifies credentials and hashes passwords using `bcryptjs`.
3. Backend generates a JWT (JSON Web Token) and sends it to the client.
4. Client stores the JWT and sends it in the `Authorization: Bearer <token>` header.
5. The `authMiddleware` intercepts restricted routes, decodes the token, and attaches `req.user`.

## 7. Real-Time System (Socket.io)
**Rule**: Socket.io is used *only* for real-time transport, NEVER for permanent storage.
Flow:
1. Client performs an action (e.g., sends a message).
2. Backend receives the HTTP request and **saves it to MongoDB**.
3. Upon successful save, the Backend emits a Socket.io event to connected clients.
4. If a client disconnects, they will fetch the missed data from MongoDB upon reconnecting.

### Key Events:
- `new_message`: Emitted when a chat message is saved.
- `new_notification`: Emitted when a mentorship/research alert is saved.
- `new_global_activity`: Emitted for the Landing Page ticker when an activity is saved.

## 8. Data Flow & Notification Flow
1. **Trigger**: An Alumni accepts a Mentorship Request.
2. **Controller (`mentorshipController.js`)**: 
   - Updates the `MentorshipRequest` status to 'accepted' in MongoDB.
   - Creates a new `Notification` document for the Student in MongoDB.
   - Creates a new global `Activity` document for the Landing Page.
3. **Socket Broadcast**: 
   - Emits `new_notification` to the Student's specific socket room.
   - Emits `new_global_activity` to the global feed.
4. **Client-Side**: Receives the socket event and updates the UI. If the user refreshes, the data is fetched directly from the `/api/notifications` route.

## 9. Security & File Management
- **Role-Based Access**: Middleware ensures Students cannot access Alumni-only endpoints and vice versa.
- **File Uploads**: Managed via Multer. Files (PDFs, Images, Resumes) are stored securely, and their paths/URLs are saved in MongoDB.
- **Validation**: Strict Mongoose schema validation ensures no malformed data is injected into the database.
