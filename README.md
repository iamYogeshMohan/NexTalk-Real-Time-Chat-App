# NexTalk — Real-Time Group Chat App 💬

NexTalk is a powerful MERN stack real-time chat application featuring a premium dark glassmorphism UI. It provides instant messaging, live typing indicators, and online presence tracking.

## ✨ Features
- **Real-Time Mesh**: Instant messaging via Socket.io.
- **Member Sync**: Live typing indicators and online/offline status.
- **Authentication**: Secure registration, login, and session persistence with JWT.
- **Room Control**: Create and discover public chat rooms.
- **Soft Delete**: Remove your own messages instantly.

## 🛠️ Built With
- **Frontend**: React.js (Vite), Axios, Socket.io-client
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Styling**: Custom CSS (Glassmorphism)

## ⚙️ How to Run

### 1. Configure Environment
Create a **`server/.env`** file with these keys:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/nextalk
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

### 2. Install & Start
Run these commands from the root directory:

**Install everything:**
```bash
npm run install:all
```

**Start the app (in separate terminals):**
- **Server**: `npm run server`
- **Client**: `npm run client`

Open: **http://localhost:3000** 🚀

---
Built with ❤️ by [Yogesh Mohan](https://github.com/iamYogeshMohan)
