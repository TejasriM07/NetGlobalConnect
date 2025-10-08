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
import MessagingPage from "./components/MessagingPage";
import JobList from "./jobs/JobList";
import CreateJob from "./jobs/CreateJob";
import ApplicantsList from "./jobs/ApplicantsList";
import SearchResults from "./pages/SearchResult";
import TokenHandler from "./pages/TokenHandler";

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
    path="/search-results"
    element={
      <PrivateRoute>
        <SearchResults />
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

        {/* ✅ Messaging routes */}
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <MessagingPage />
            </PrivateRoute>
          }
        />

        {/* ✅ Chat route */}
        <Route
          path="/chat/:id"
          element={
            <PrivateRoute>
              <MessagingPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <TokenHandler />
            </PrivateRoute>
          }
        />

        <Route
          path="/feed"
          element={
            <PrivateRoute>
              <Feed />
            </PrivateRoute>
          }
        />

        {/* Notifications page removed - replaced by unread messages ping on Inbox/Messages */}

        <Route
          path="/jobs"
          element={
            <PrivateRoute>
              <JobList />
            </PrivateRoute>
          }
        />

        <Route
          path="/create-job"
          element={
            <PrivateRoute>
              <CreateJob />
            </PrivateRoute>
          }
        />

        <Route path="/jobs/:jobId/applicants" element={
          <PrivateRoute>
            <ApplicantsList />
          </PrivateRoute>
        } />
      </Routes>

    </Router>
  );
}
