# 🚀 Taskflow – Multi-Tenant Role-Based Task Management Platform

**Taskflow** is a powerful full-stack web application built with modern technologies, offering a complete **multi-tenant**, **role-based** task management system. With real-time updates, analytics, email notifications, AI assistance, and secure user handling — it's built for both productivity and scalability.

---

## 🛠️ Tech Stack

### Backend:
- **Node.js** + **Express** (with **TypeScript**)
- **MongoDB** + **Mongoose**
- **Redis** for caching
- **JWT Authentication**
- **Nodemailer** for transactional emails
- **Cloudinary** for profile image storage
- **Socket.IO** for real-time organization chat
- **Gemini AI API** for chatbot integration

### Frontend:
- **React** (with **TypeScript**)
- **TailwindCSS** for styling
- **Zustand** for state management
- **TanStack Query** for frontend caching
- **React Hook Form** + **Zod** for form validation
- **Socket.IO Client** for live chat

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure JWT-based login system
- Role-based access: **Admins** and **Members**
- Expiring invite codes for secure organization joining (24 hours or single use)
- Removed users cannot re-login; they’re redirected to the org setup page

### 🏢 Organization Management
- Create or join organizations
- Admin capabilities:
  - Invite members via generated codes
  - Manage users and tasks with full CRUD
  - Access organization-wide reports and analytics
  - Download reports in **PDF** or **Excel**

### ✅ Task Management
- Create, assign, and track tasks
- Support for detailed **subtasks (To-Dos)**
- Status updates: `Pending`, `In Progress`, `Completed`
- Real-time updates across the organization
- Role-restricted visibility: members see only their tasks

### 💬 Organization Chat
- Real-time messaging within organizations
- Built using **Socket.IO** for backend and frontend
- Instant updates across users without refreshing

### 📦 Caching
- **Backend:** Redis caching for improved performance and reduced database load
- **Frontend:** TanStack Query for efficient data fetching, caching, and background updates

### 📧 Email Notifications
- Users receive an email upon task assignment
- Admins get notified when a task is completed (with user list & task info)

### 🤖 AI Chatbot (Powered by Gemini AI)
- Admin-exclusive chatbot trained on org-specific data
- Answers questions, summarizes tasks, and provides real-time insights
- Can delete users upon admins request

### 📊 Analytics & Reports
- Visual charts and metrics in admin dashboard
- Task and user insights
- Downloadable reports(PDF or Excel format):
  - Users: see their own tasks
  - Admins: see full org-wide data

### 🖼️ Profile Image Uploads
- Users can upload profile images
- Stored securely using **Cloudinary**

---

## 🌍 Environment Variables

### 🧠 Frontend (`/Frontend`)
```env
VITE_API_URL=your_backend_api_url
```

### ⚙️ Backend (`/Backend`)
```env
CLIENT_URL=your_frontend_url
FRONTEND_URL=your_frontend_url
JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_connection_string

GMAIL_USER=your_gmail_address
GMAIL_PASS=your_gmail_app_password

CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GEINI_API_KEY=your_gemini_api_key

REDIS_URL=your_redis_server_url
```

> 🔒 Make sure to store these securely and **never commit them to your repo**!

---

## 🚀 Getting Started

### 1. Clone the Repo
```bash
git clone https://github.com/NahomT23/task-manager.git
```

### 2. Setup Backend
```bash
cd server
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd ../client
npm install
npm run dev
```

### 4. Setup Environment
- Create `.env` files in `/Backend` and `/Frontend` as shown above
- Ensure all keys and URLs are correct and functional

---
