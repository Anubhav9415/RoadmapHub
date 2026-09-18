# 🎥 Project Presentation Video Script & Submission Checklist

---

## 🎙️ Spoken Video Script (Target: 10–12 Minutes)

---

### **0:00 – 0:30 | Introduction**
> *"Hi everyone! My name is Anubhav, and today I'm presenting my Feature Request & Public Roadmap Portal — a full-stack, open-source feedback management platform inspired by tools like Canny, Featurebase, and Productboard.*
>
> *I built this application using the MERN stack: MongoDB, Express, React 18, and Node.js, combined with Vite, TanStack Query, and Zustand.*
>
> *In this video, I will walk you through a live demonstration of the portal, explain the architecture and database schema, dive into key technical challenges like dual-token auth and optimistic UI updates, and review what I learned."*

---

### **0:30 – 1:30 | Problem Statement & Solution**
> *"Every growing software product faces a common challenge: user feedback gets scattered across support tickets, Discord channels, and emails. Product managers struggle to understand what features users actually want most, and users feel disconnected when they don't know what's coming next.*
>
> *This portal solves both problems in a unified workflow:*
> 1. *It provides a public, community-driven feedback board where users can submit ideas, search existing requests to prevent duplicates, and upvote the features that matter most to them.*
> 2. *It includes a transparent Public Roadmap with Kanban columns — Planned, In Progress, and Completed — giving users real-time visibility into the product lifecycle.*
> 3. *It equips product admins with a dashboard to moderate posts, adjust statuses, and manage user roles seamlessly."*

---

### **1:30 – 3:30 | Live Demo Walkthrough**
*(Screen recording walkthrough)*

1. **Homepage & Feed**:
   > *"Let’s start on the home feed. Here we see feature requests sorted by top upvotes. Users can easily filter by category — like Feature, Bug, or Improvement — or search in real-time."*

2. **Submitting a Request**:
   > *"When a user wants to submit a new idea, clicking 'New Post' opens our submission form with full Markdown support. As soon as I submit, TanStack Query invalidates the cache and our new post immediately appears."*

3. **Upvoting with Optimistic Feedback**:
   > *"Notice the upvote button. When I click it, the counter increments instantly without waiting for a server roundtrip, accompanied by a toast notification. If the network request fails, React Query automatically rolls back the UI state."*

4. **Post Detail & Threaded Comments**:
   > *"Clicking on any post takes us to the detail page. Here we have full Markdown rendering, relative timestamps, and an interactive comment thread. Users can post top-level comments or reply directly to other users, forming a clean recursive thread."*

5. **Roadmap & Admin Status Updates**:
   > *"Next, let's navigate to the Public Roadmap. We see a 3-column Kanban board that auto-polls every 30 seconds for live updates.*
   >
   > *Now let's log in with our seeded admin account. On the Admin Dashboard or directly on the post detail page, I can change the status from 'Open' to 'In Progress'. When I jump back to the Roadmap, the card is immediately organized into the 'In Progress' column!"*

---

### **3:30 – 4:30 | Tech Stack Choices & Rationale**
> *"Let's talk about why I chose this specific tech stack:*
> - * **MongoDB & Mongoose**: Selected because feedback portals heavily benefit from atomic array operations (like `$addToSet` and `$pull` for upvotes) and flexible document nesting for comments.*
> - * **Express & Node.js**: Provides a lightweight, high-throughput REST API with robust middleware pipelines for auth and validation.*
> - * **React 18 + Vite**: Delivers sub-second hot module replacement during development and blazing fast production builds.*
> - * **TanStack React Query v5**: Handles server state management, intelligent cache invalidation, deduplicated requests, and automatic background polling for the roadmap.*
> - * **Zustand**: Used for client state (authentication session and theme/filter preferences) because of its minimal boilerplate and direct localStorage persistence."*

---

### **4:30 – 6:00 | Architecture Walkthrough**
> *"Here is how the application is structured as a clean monorepo with `server/` and `client/` workspaces:*
>
> - *On the backend, request flow follows a strict layer separation:*
>   `Route` ➔ `Middleware (Auth / RBAC / Validation)` ➔ `Controller` ➔ `Model / Service` ➔ `Standard API Response`.
>
> - *All API responses conform to a unified envelope:*
>   `{ success: true, message: string, data: { ... } }`
>   *This guarantees predictable consumption on the frontend.*
>
> - *On the frontend, an Axios interceptor automatically attaches the Bearer access token to requests and catches 401 errors to perform a silent refresh token rotation."*

---

### **6:00 – 7:30 | Database Design & Atomic Operations**
> *"Let’s look at the database schema design:*
>
> 1. * **User Schema**: Stores authentication credentials, hashed passwords, roles (`user` vs `admin`), verification status, and hashed refresh tokens.*
> 2. * **Post Schema**: Contains title, category, status enum, author reference, comment count, and an `upvotes` array of User ObjectIDs.*
>
> *For upvoting, rather than reading and updating the count in JavaScript which causes race conditions under concurrent traffic, we use atomic MongoDB operations:*
> ```javascript
> const hasVoted = post.upvotes.includes(userId);
> const update = hasVoted
>   ? { $pull: { upvotes: userId }, $inc: { upvoteCount: -1 } }
>   : { $addToSet: { upvotes: userId }, $inc: { upvoteCount: 1 } };
> await Post.findByIdAndUpdate(postId, update);
> ```
> *This guarantees consistency and zero vote duplication regardless of how many users vote simultaneously."*

---

### **7:30 – 9:00 | Dual-Token JWT Authentication & Security**
> *"Security was a primary focus for this project. Instead of storing long-lived JWTs in localStorage where they are vulnerable to XSS, we implemented a dual-token JWT architecture:*
>
> 1. * **Access Token**: Short-lived (15 minutes), passed in the `Authorization: Bearer <token>` header.*
> 2. * **Refresh Token**: Long-lived (7 days), stored in an `httpOnly`, `sameSite: strict`, secure cookie.*
>
> *When the access token expires, the client calls `/api/v1/auth/refresh`. The server verifies the cookie, checks the bcrypt hash stored on the user record in MongoDB, and issues a **brand new pair of access and refresh tokens**.*
>
> *If a refresh token is reused or tampered with, the server immediately revokes all sessions for that user as an automatic breach defense."*

---

### **9:00 – 10:00 | Frontend State Management & Optimistic UI**
> *"On the client, managing server state and user feedback requires zero friction:*
> - *When a user clicks upvote, TanStack Query cancels outgoing refetches, snapshots the previous cache, updates the local vote count immediately, and rolls back if the network fails.*
> - *The Public Roadmap uses React Query's `refetchInterval: 30000` to silently sync in the background, showing a live pulsing indicator.*
> - *Toast notifications via `react-hot-toast` provide instant, clear feedback for every action (signup, vote, comment, status change, and error alerts)."*

---

### **10:00 – 11:00 | Challenges Faced & How I Solved Them**
> *"During development, I encountered two interesting technical challenges:*
>
> 1. * **Threaded Comment Tree Building**: The API returns a list of comments with `parentComment` references. Rendering these recursively with soft-delete support required building an efficient tree transformation algorithm that preserves child reply chains even when an intermediate comment is deleted.*
>
> 2. * **Admin Self-Role Protection**: In the Admin Dashboard, an administrator could accidentally demote themselves to a standard user, locking themselves out. I resolved this by highlighting the active user's row and disabling role modifications on their own ID."*

---

### **11:00 – 12:00 | Summary & Future Improvements**
> *"If I had more time, my next milestones would include:*
> - *Direct file uploads to AWS S3/Cloudinary for screenshot attachments in feedback posts.*
> - *WebSocket or Server-Sent Events (SSE) integration for instant vote count and comment streaming without polling.*
> - *OAuth 2.0 social login with GitHub and Google.*
>
> *Thank you very much for your time and for reviewing my submission! All code is publicly available in the GitHub repository."*

---

## ✅ Final Submission Checklist

```markdown
### 📋 Final Submission Checklist

- [x] **Monorepo Repository Publicly Accessible on GitHub**
- [x] **Complete `README.md` in repository root with all required sections**
  - [x] Project description & Tech stack breakdown
  - [x] Features list
  - [x] Project folder structure
  - [x] Prerequisites & Step-by-step installation instructions
  - [x] Environment variables reference table (`.env.example`)
  - [x] Local run commands (port 5000 server, port 5173 client)
  - [x] Complete REST API documentation table
  - [x] Database & collection details
  - [x] Admin seed credentials instructions
  - [x] Assumptions & limitations
  - [x] MIT License
- [x] **Dual-token JWT Auth with Refresh Rotation & httpOnly Cookies**
- [x] **Atomic Upvoting Logic with Optimistic UI**
- [x] **Recursive Threaded Comments with Soft Delete**
- [x] **Public Kanban Roadmap with 30s live auto-refresh**
- [x] **Admin Dashboard with Post and User Moderation**
- [x] **Comprehensive Toast Notifications & EmptyState components**
- [x] **Mobile Responsive Design verified across viewports**
- [x] **Video Explanation Recorded & Uploaded**
  - [x] Video link set to Public / Unlisted
  - [x] Covers Introduction, Demo, Tech Choices, Architecture, Database, Auth, Challenges, and Future Scope
- [x] **Official Submission Form Filled**: [https://forms.gle/UbEiStpegGWcYrHy8](https://forms.gle/UbEiStpegGWcYrHy8)
```
