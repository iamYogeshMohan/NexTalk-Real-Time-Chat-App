# NexTalk — Real-Time Group Chat App 💬

NexTalk is a high-performance, real-time group chat application featuring a sleek dark glassmorphism UI. Built with the MERN stack and Socket.io, it supports instant messaging, live typing indicators, and online presence tracking.

![NexTalk Preview](https://via.placeholder.com/1000x500/0d0d14/7c6ff7?text=NexTalk+Real-Time+Chat+App)

## 🚀 Features

- **Real-Time Communication**: Instant messaging powered by Socket.io.
- **User Authentication**: Secure JWT-based registration and login with bcrypt hashing.
- **Room Management**: Create and browse public chat rooms easily.
- **Live Typing Indicators**: See who is typing in real-time with a 3-dot animated indicator.
- **Online Presence**: Track online members in each room with live status dots.
- **Message History**: Automatic loading of the last 50 messages when joining a room.
- **Soft Delete**: Users can delete their own messages (soft-delete functionality).
- **Responsive Design**: Premium dark glassmorphism theme that works across desktop and mobile.
- **Secure Architecture**: JWT token stored in localStorage with auto-logout on token expiration.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Axios, Socket.io-client, React Router v6
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Styling**: Vanilla CSS (Custom Glassmorphism)

## 📁 Repository Structure

```
nextalk/
├── client/          # React frontend (Vite)
├── server/          # Node.js/Express backend
├── README.md        # Documentation
└── LICENSE          # MIT License
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/iamYogeshMohan/NexTalk-Real-Time-Chat-App.git
cd NexTalk-Real-Time-Chat-App
```

### 2. Configure Backend
Create a `server/.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/nextalk
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
npm run install:all
```

### 4. Run the Application
In separate terminals, run:

**Start Server:**
```bash
npm run server
```

**Start Client:**
```bash
npm run client
```

Visit: **http://localhost:3000** 🚀

## 📜 API Endpoints

| Route | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login and receive JWT |
| `/api/rooms` | GET | List all public rooms |
| `/api/messages/:roomId` | GET | Paginated message history |

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by [Yogesh Mohan](https://github.com/iamYogeshMohan)
