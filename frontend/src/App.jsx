<<<<<<< Updated upstream
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1 className='text-red-800'>Vite + React</h1>
      </div>
    </>
  )
}

export default App
=======
// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./menu/Navbar";
import Signup from "./menu/Signup";
import Login from "./menu/Login";
import Profile from "./components/Profile";
import ProfileForm from "./components/ProfileForm";
import PrivateRoute from "./menu/PrivateRoute";
import Feed from "./pages/Feed";
import UserProfile from "./components/UserProfile";
import ChatPage from "./components/ChatPage";
import MessagesList from "./components/MessagesList"; // ✅ FIX: import normally

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <PrivateRoute>
              <ProfileForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />

        {/* ✅ Inbox route */}
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <MessagesList />
            </PrivateRoute>
          }
        />

        {/* ✅ Chat route */}
        <Route
          path="/messages/:id"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Feed />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
>>>>>>> Stashed changes
