# Music Playlist Management System

A full-stack Music Playlist Management System built with React TypeScript, Express.js, MongoDB, and Spotify API integration. Create, manage, and organize your music playlists with songs from Spotify's extensive catalog.

## 🎵 Features

- **🔐 User Authentication**: Secure registration and login with JWT tokens
- **📝 Playlist Management**: Complete CRUD operations for playlists
- **🔍 Spotify Integration**: Search millions of songs using Spotify Web API
- **📱 Responsive Design**: Works seamlessly across all devices and screen sizes
- **🎨 Modern UI**: Clean, intuitive interface inspired by Spotify's design
- **🔒 Secure**: Password hashing with bcrypt, JWT authentication, protected routes
- **📊 Pagination**: Efficient handling of large datasets with search functionality
- **⚡ Real-time Updates**: Instant search results and playlist updates

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive styling
- **shadcn/ui** component library for consistent UI
- **React Hook Form** with Zod validation for form handling
- **TanStack Query** for efficient data fetching and caching
- **Wouter** for lightweight client-side routing

### Backend
- **Node.js** with Express.js framework
- **TypeScript** for full-stack type safety
- **MongoDB** with Mongoose ODM for data persistence
- **JWT** for stateless authentication
- **bcryptjs** for secure password hashing
- **Spotify Web API** for music data integration
- **CORS** enabled for cross-origin requests

### Development Tools
- **Vite** for fast development and building
- **ESLint** and **Prettier** for code quality
- **Postman** collection for API testing

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v18.0.0 or higher)
- **MongoDB** (local installation or cloud instance like MongoDB Atlas)
- **Spotify Developer Account** (for API credentials)
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/SmitSarvadhi4545/Prop-full-stack.git
```

### 2. Run backend

```bash
cd server
npm install
npm run dev
```

### 3. Run frontend

```bash
cd client
npm install
npm run dev
```