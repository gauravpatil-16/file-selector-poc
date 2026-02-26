import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { getRouteConfig } from "@/router/route.utils";
import Root from "@/layouts/Root";
import Layout from "@/components/organisms/Layout";

// Lazy load components
const Feed = lazy(() => import("@/components/pages/Feed"));
const Discover = lazy(() => import("@/components/pages/Discover"));
const Create = lazy(() => import("@/components/pages/Create"));
const Messages = lazy(() => import("@/components/pages/Messages"));
const Profile = lazy(() => import("@/components/pages/Profile"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

// Authentication pages
const AuthenticatedUserLogin = lazy(() => import("@/pages/auth/AuthenticatedUserLogin"));
const AuthenticatedUserSignup = lazy(() => import("@/pages/auth/AuthenticatedUserSignup"));
const Callback = lazy(() => import("@/pages/auth/Callback"));
const ErrorPage = lazy(() => import("@/pages/auth/ErrorPage"));
const AccessDenied = lazy(() => import("@/pages/auth/AccessDenied"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const PromptPassword = lazy(() => import("@/pages/auth/PromptPassword"));
// createRoute helper function - CRITICAL PATTERN
const createRoute = ({
  path,
  index,
  element,
  access,
  children,
  ...meta
}) => {
  // Get config for this route
  let configPath
  if (index) {
    configPath = "/"
  } else {
    configPath = path.startsWith('/') ? path : `/${path}`
  }

  const config = getRouteConfig(configPath)
  const finalAccess = access || config?.allow

  const route = {
    ...(index ? { index: true } : { path }),
    element: element ? <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  </div>}>{element}</Suspense> : element,
    handle: {
      access: finalAccess,
      ...meta,
    },
  }

  if (children && children.length > 0) {
    route.children = children
  }

  return route
}

// Main application routes
const mainRoutes = [
  createRoute({ 
    index: true, 
    element: <Feed />
  }),
  createRoute({ 
    path: "discover", 
    element: <Discover />
  }),
  createRoute({ 
    path: "create", 
    element: <Create />
  }),
  createRoute({ 
    path: "messages", 
    element: <Messages />
  }),
  createRoute({ 
    path: "profile", 
    element: <Profile />
  }),
  createRoute({ 
    path: "*", 
    element: <NotFound />
  })
]

// Routes configuration
const routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      // Authentication routes
      createRoute({ path: "/authenticateduser/login", element: <AuthenticatedUserLogin /> }),
      createRoute({ path: "/authenticateduser/signup", element: <AuthenticatedUserSignup /> }),
      createRoute({ path: "/callback", element: <Callback /> }),
      createRoute({ path: "/error", element: <ErrorPage /> }),
      createRoute({ path: "/access-denied", element: <AccessDenied /> }),
      createRoute({ path: "/reset-password/:appId/:fields", element: <ResetPassword /> }),
      createRoute({ path: "/prompt-password/:appId/:emailAddress/:provider", element: <PromptPassword /> }),
      
      // Main app routes with layout
      {
        path: "/",
        element: <Layout />,
        children: mainRoutes
      }
]
  }
];

export const router = createBrowserRouter(routes);