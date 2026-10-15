/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { RouterProvider, useRouter } from "./context/RouterContext";
import RootLayout from "./app/layout";
import PublicLandingPage from "./app/page";
import LoginPage from "./app/(auth)/login/page";
import SignupPage from "./app/(auth)/signup/page";
import ForgotPasswordPage from "./app/(auth)/forgot-password/page";
import DashboardLayout from "./app/(dashboard)/layout";
import DashboardPage from "./app/(dashboard)/dashboard/page";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ProtectedNewPage } from "./components/protected/ProtectedNewPage";
import { useTradeStore } from "./store/useTradeStore";

function AppRoutes() {
  const { pathname } = useRouter();
  const { isAuthenticated } = useTradeStore();

  // 1. Admin Verification Dashboard route
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return <AdminDashboard />;
  }

  // 2. Protected Destination Page route
  if (pathname === "/new-page" || pathname.startsWith("/new-page")) {
    return <ProtectedNewPage />;
  }

  // 3. Auth routes
  if (pathname === "/login") {
    return <LoginPage />;
  }

  if (pathname === "/signup") {
    return <SignupPage />;
  }

  if (pathname === "/forgot-password") {
    return <ForgotPasswordPage />;
  }

  // 4. Protected Dashboard routes
  if (pathname.startsWith("/dashboard")) {
    return (
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    );
  }

  // 5. Root Public Landing Page (or default)
  if (pathname === "/") {
    return <PublicLandingPage />;
  }

  // 6. Default fallback: If authenticated, open Dashboard; otherwise Landing page
  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    );
  }

  return <PublicLandingPage />;
}


export default function App() {
  return (
    <RouterProvider>
      <RootLayout>
        <AppRoutes />
      </RootLayout>
    </RouterProvider>
  );
}
