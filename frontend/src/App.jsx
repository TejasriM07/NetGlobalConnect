// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./menu/Navbar";
import Footer from "./components/Footer";
import Signup from "./menu/Signup";
import Login from "./menu/Login";
import Profile from "./components/Profile";
import ProfileForm from "./components/ProfileForm";
import PrivateRoute from "./menu/PrivateRoute";
import Feed from "./pages/Feed";
import Landing from "./pages/Landing";
import OAuthSuccess from "./pages/OAuthSuccess";
import UserProfile from "./components/UserProfile";
import ChatPage from "./components/ChatPage";
import MessagesList from "./components/MessagesList";
import JobList from "./jobs/JobList";
import ApplicantsList from "./jobs/ApplicantsList";
import SearchResults from "./pages/SearchResult";
import ReportedPosts from "./pages/ReportedPosts";
import MyReportedPosts from "./pages/MyReportedPosts";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-neutral-950">
        <Navbar />
        <main className="flex-1">
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

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

        <Route path="/" element={<Landing />} />
        <Route
          path="/feed"
          element={
            <PrivateRoute>
              <Feed />
            </PrivateRoute>
          }
        />
        <Route
          path="/reported-posts"
          element={
            <PrivateRoute>
              <ReportedPosts />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-reported-posts"
          element={
            <PrivateRoute>
              <MyReportedPosts />
            </PrivateRoute>
          }
        />

        <Route
          path="/jobs"
          element={
            <PrivateRoute>
              <JobList />
            </PrivateRoute>
          }
        />

        <Route path="/jobs/:jobId/applicants" element={
          <PrivateRoute>
            <ApplicantsList />
          </PrivateRoute>
        } />
      </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
