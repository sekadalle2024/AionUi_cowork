/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ConfigStorage } from '@/common/storage';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loginEnabled, setLoginEnabled] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // Check if login is enabled in settings
      const enabled = await ConfigStorage.get('security.loginEnabled');

      if (enabled !== true) {
        // Login not required
        setLoginEnabled(false);
        setIsLoggedIn(true);
        return;
      }

      setLoginEnabled(true);

      // Check if user is logged in
      const loggedIn = localStorage.getItem('eaudit_logged_in') === 'true';
      const loginTime = localStorage.getItem('eaudit_login_time');

      if (loggedIn && loginTime) {
        // Check if login is still valid (24 hours)
        const now = Date.now();
        const elapsed = now - parseInt(loginTime, 10);
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (elapsed < twentyFourHours) {
          setIsLoggedIn(true);
        } else {
          // Session expired
          localStorage.removeItem('eaudit_logged_in');
          localStorage.removeItem('eaudit_login_time');
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Failed to check login status:', error);
      // On error, allow access
      setLoginEnabled(false);
      setIsLoggedIn(true);
    }
  };

  // Loading state
  if (loginEnabled === null) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-1'>
        <div className='text-2'>Chargement...</div>
      </div>
    );
  }

  // If login is not enabled or user is logged in, show children
  if (!loginEnabled || isLoggedIn) {
    return <>{children}</>;
  }

  // Redirect to login
  return <Navigate to='/login' replace />;
};

export default ProtectedRoute;
