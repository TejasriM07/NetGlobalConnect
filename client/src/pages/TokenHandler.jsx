import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProfile, setAuthToken } from '../api';
import Feed from './Feed';

const TokenHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [tokenProcessed, setTokenProcessed] = useState(false);

  useEffect(() => {
    const checkForToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      
      if (token && !tokenProcessed) {
        console.log("OAuth token detected at root, setting auth...");
        setTokenProcessed(true);
        setAuthToken(token);

        try {
          const res = await getProfile();
          const meData = res.data?.data || res.data;
          if (meData) {
            localStorage.setItem("userRole", meData.role || "");
            localStorage.setItem("userId", meData._id || meData.id || "");
          }
          
          // Clear the token from URL and show the feed
          window.history.replaceState({}, document.title, "/");
          setLoading(false);
        } catch (err) {
          console.error("Error processing OAuth token:", err);
          // Clear the token from URL and show the feed anyway
          window.history.replaceState({}, document.title, "/");
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkForToken();
  }, [location.search, tokenProcessed]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Completing your sign-in...</p>
        </div>
      </div>
    );
  }

  return <Feed />;
};

export default TokenHandler;