# Feature Request & Public Roadmap Portal

A full-stack, enterprise-grade Feature Request & Public Roadmap Portal (an open-source alternative to Canny, Featurebase, and Productboard) built with the **MERN** stack (MongoDB, Express, React 18, Node.js).

---

## 📌 Project Description

This portal empowers product teams to collect, organize, and prioritize customer feedback in real time. Users can submit feature requests, upvote suggestions, and join discussions through nested comments, while product managers and administrators can manage statuses on a live Kanban roadmap, pin announcements, and moderate users.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Data Fetching & Caching**: TanStack React Query v5 (automatic background refetching, optimistic mutations, query invalidation)
- **State Management**: Zustand with persistent storage
- **Routing**: React Router DOM v7
- **Styling**: Vanilla CSS (Custom Design System with responsive grid, glassmorphism, and dark/light tokens)
- **Rich Text & Markdown**: `react-markdown`, `remark-gfm`, and `@uiw/react-md-editor`
- **Feedback & Notifications**: `react-hot-toast`
- **Drag and Drop**: `@hello-pangea/dnd` / `react-beautiful-dnd`

### Backend
- **Runtime & Framework**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Dual-token JWT (Access Token in memory/header, Refresh Token in `httpOnly`, `sameSite: strict` cookie) with rotation and bcrypt hashing
- **Security**: Helmet, CORS with credentials, express-rate-limit, express-validator
- **Email Service**: Nodemailer with Ethereal SMTP simulation for verification and password reset flows

---

## ✨ Features

- 🔐 **Dual-Token Authentication**: Secure 15-minute short-lived Access Tokens with 7-day rotating Refresh Tokens stored in `httpOnly` cookies.
- ✉️ **Email Verification & Password Reset**: Automated email links generated via Ethereal SMTP with preview URLs.
- 💡 **Feature Request Feed**: Search, sort (top voted, newest, most commented), and filter by category (Feature, Bug, Improvement, Other) and status.
- 🔼 **Atomic Upvoting**: Fast, concurrent-safe upvote/downvote toggle with instant UI feedback and `$addToSet` / `$pull` database operations.
- 💬 **Threaded Nested Comments**: Recursive comment discussions with reply chains, markdown support, inline editing, and soft-delete capabilities.
- 📊 **Public Kanban Roadmap**: 3-column live Kanban board (Planned, In Progress, Completed) with 30-second auto-sync polling.
- 🛡️ **Role-Based Admin Dashboard**:
  - Full post moderation (status updates, pin/unpin, hard delete).
  - User role management (promote/demote admin roles with self-protection).
- 📱 **Fully Responsive UI**: Mobile-first responsive navigation, stacked feeds, and touch-friendly controls.

---

## 📁 Project Structure

```
Company_Project/
├── package.json               # Root workspaces configuration
├── README.md                  # Comprehensive documentation
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── app.js                 # Express app configuration & middleware
│   ├── server.js              # Server entry point & DB connection
│   └── src/
│       ├── config/
│       │   ├── db.js          # MongoDB connection handler
│       │   └── email.js       # Nodemailer transporter & email templates
│       ├── controllers/
│       │   ├── admin.controller.js
│       │   ├── auth.controller.js
│       │   ├── comment.controller.js
│       │   └── post.controller.js
│       ├── middleware/
│       │   ├── auth.middleware.js     # JWT Bearer token verification
│       │   ├── errorHandler.js        # Global error & AppError handler
│       │   ├── rbac.middleware.js     # Admin role authorization
│       │   └── validate.middleware.js # express-validator runner
│       ├── models/
│       │   ├── Comment.model.js
│       │   ├── Post.model.js
│       │   └── User.model.js
│       ├── routes/
│       │   ├── admin.routes.js
│       │   ├── auth.routes.js
│       │   ├── comment.routes.js
│       │   └── post.routes.js
│       ├── utils/
│       │   ├── apiResponse.js         # Standardized JSON response envelope
│       │   ├── cookie.utils.js        # httpOnly cookie setters & clearers
│       │   ├── jwt.utils.js           # Token signing & verification
│       │   └── seedAdmin.js           # Admin user initialization
│       └── validators/
│           ├── auth.validator.js
│           └── post.validator.js
└── client/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── components/
        │   ├── comments/
        │   │   ├── CommentItem.jsx
        │   │   ├── CommentItem.css
        │   │   ├── CommentThread.jsx
        │   │   └── CommentThread.css
        │   ├── kanban/
        │   │   ├── KanbanBoard.jsx
        │   │   ├── KanbanColumn.jsx
        │   │   └── Kanban.css
        │   └── ui/
        │       ├── Badge.jsx
        │       ├── EmptyState.jsx
        │       ├── EmptyState.css
        │       ├── SkeletonCard.jsx
        │       ├── SkeletonCard.css
        │       ├── UpvoteButton.jsx
        │       └── UpvoteButton.css
        ├── hooks/
        │   ├── useAdmin.js
        │   ├── useComments.js
        │   ├── usePost.js
        │   └── useRoadmap.js
        ├── lib/
        │   └── api.js                 # Axios instance with 401 interceptor
        ├── pages/
        │   ├── AdminPage.jsx
        │   ├── AdminPage.css
        │   ├── PostDetailPage.jsx
        │   ├── PostDetailPage.css
        │   ├── RoadmapPage.jsx
        │   └── RoadmapPage.css
        ├── store/
        │   └── authStore.js           # Zustand persisted auth store
        └── utils/
            └── timeAgo.js             # Friendly relative timestamp formatter
```

---

## ⚙️ Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas cluster
- **Git**

---

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Anubhav9415/Portfolio.git
   cd Portfolio
   ```

2. **Install all dependencies (monorepo root)**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment files for both server and client:
   ```bash
   cp server/.env.example server/.env
   ```

4. **Seed Default Admin User**:
   ```bash
   npm run seed --workspace=server
   ```

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | Port for Express server | `5000` |
| `NODE_ENV` | Runtime environment (`development` \| `production`) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/feature_portal` |
| `JWT_ACCESS_SECRET` | Secret key for signing Access Tokens | `your_access_secret_key_32_chars` |
| `JWT_REFRESH_SECRET` | Secret key for signing Refresh Tokens | `your_refresh_secret_key_32_chars` |
| `JWT_ACCESS_EXPIRES` | Expiration window for Access Tokens | `15m` |
| `JWT_REFRESH_EXPIRES`| Expiration window for Refresh Tokens | `7d` |
| `CLIENT_URL` | Frontend URL for CORS and email links | `http://localhost:5173` |
| `EMAIL_HOST` | SMTP server host | `smtp.ethereal.email` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | `your_ethereal_user` |
| `EMAIL_PASS` | SMTP password | `your_ethereal_pass` |
| `ADMIN_SEED_EMAIL` | Default seeded admin email | `admin@portal.local` |
| `ADMIN_SEED_PASSWORD`| Default seeded admin password | `AdminPassword123!` |

### Client (`client/.env`)

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for backend API v1 | `http://localhost:5000/api/v1` |

---

## 💻 Running Locally

### Run both Client & Server concurrently:
```bash
npm run dev
```

- **Client**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:5000](http://localhost:5000)

### Or run individually:
- **Server only**: `npm run dev --workspace=server`
- **Client only**: `npm run dev --workspace=client`

---

## 📖 API Documentation

All endpoints are prefixed with `/api/v1`.

### Authentication Endpoints (`/api/v1/auth`)

| Method | Route | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup` | No | Register new user & dispatch verification email |
| `GET` | `/verify-email/:token` | No | Confirm email address |
| `POST` | `/login` | No | Authenticate user, return JWT & set cookie |
| `POST` | `/refresh` | Cookie | Rotate access & refresh tokens |
| `POST` | `/logout` | Optional | Clear session cookie & revoke refresh token |
| `POST` | `/forgot-password` | No | Send password reset token email |
| `POST` | `/reset-password/:token`| No | Reset password with valid token |
| `GET` | `/me` | Bearer Token | Fetch current authenticated user profile |

### Posts Endpoints (`/api/v1/posts`)

| Method | Route | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | No | List feature requests with search, filter & pagination |
| `GET` | `/:id` | No | Retrieve single post details |
| `POST` | `/` | User | Create a new feature request |
| `PATCH` | `/:id` | Author / Admin | Update post title, description, or category |
| `DELETE` | `/:id` | Author / Admin | Soft or hard delete post |
| `POST` | `/:id/upvote` | User | Toggle upvote on post |

### Comments Endpoints (`/api/v1/comments`)

| Method | Route | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/?postId=:id` | No | Fetch all comments for a post |
| `POST` | `/` | User | Post a top-level comment or reply |
| `PATCH` | `/:id` | Author / Admin | Edit comment text |
| `DELETE` | `/:id` | Author / Admin | Soft delete comment |

### Admin Endpoints (`/api/v1/admin`)

| Method | Route | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts` | Admin | Retrieve all posts across all statuses |
| `PATCH` | `/posts/:id/status` | Admin | Update roadmap status |
| `PATCH` | `/posts/:id/pin` | Admin | Toggle pinned post |
| `DELETE` | `/posts/:id` | Admin | Permanently delete post |
| `GET` | `/users` | Admin | List all registered users |
| `PATCH` | `/users/:id/role` | Admin | Update user role (`user` \| `admin`) |
| `GET` | `/stats` | Admin | Aggregate dashboard metrics |

---

## 🗄️ Database Setup

The application uses MongoDB with Mongoose. When starting the server with a valid `MONGODB_URI`, Mongoose automatically connects and indexes the following collections:
- **`users`**: User records, password hashes, roles, and verification/reset tokens.
- **`posts`**: Feedback posts, categories, statuses, pinned flags, upvotes array, and comment counters.
- **`comments`**: Comment items, parent/child reply relations, and soft deletion flags.

---

## 🔑 Admin Access

A pre-configured admin account can be seeded into the database:
```bash
npm run seed --workspace=server
```
- **Email**: `admin@portal.local` (or `ADMIN_SEED_EMAIL` in `.env`)
- **Password**: `AdminPassword123!` (or `ADMIN_SEED_PASSWORD` in `.env`)

---

## ⚠️ Assumptions & Limitations

- **Email Simulation**: Ethereal SMTP is used by default for testing. In a production deployment, replace with AWS SES, SendGrid, or Resend.
- **Image Uploads**: Post descriptions support standard Markdown image URLs. Direct binary file upload to S3/Cloudinary is planned for v2.

---

## 📄 License

This project is licensed under the **MIT License**.
