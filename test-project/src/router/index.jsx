import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { getRouteConfig } from "@/router/route.utils";
import Root from "@/layouts/Root";
import Layout from "@/components/organisms/Layout";

// Lazy load components
const Services = lazy(() => import("@/components/pages/Services"));
const Bookings = lazy(() => import("@/components/pages/Bookings"));
const Availability = lazy(() => import("@/components/pages/Availability"));
const BookService = lazy(() => import("@/components/pages/BookService"));
const PublicBooking = lazy(() => import("@/components/pages/PublicBooking"));
const BookingConfirmation = lazy(() => import("@/components/pages/BookingConfirmation"));
const BookingConfiguration = lazy(() => import("@/components/pages/BookingConfiguration"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

// Auth pages
const BookerLogin = lazy(() => import("@/pages/auth/BookerLogin"));
const BookerSignup = lazy(() => import("@/pages/auth/BookerSignup"));
const Callback = lazy(() => import("@/pages/auth/Callback"));
const ErrorPage = lazy(() => import("@/pages/auth/ErrorPage"));
const AccessDenied = lazy(() => import("@/pages/auth/AccessDenied"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const PromptPassword = lazy(() => import("@/pages/auth/PromptPassword"));

const createRoute = ({
  path,
  index,
  element,
  access,
  children,
  ...meta
}) => {
  // Get config for this route
  let configPath;
  if (index) {
    configPath = "/";
  } else {
    configPath = path.startsWith('/') ? path : `/${path}`;
  }

  const config = getRouteConfig(configPath);
  const finalAccess = access || config?.allow;

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
  };

  if (children && children.length > 0) {
    route.children = children;
  }

  return route;
};

const routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
createRoute({ 
            path: "", 
            index: true, 
            element: <Services /> 
          }),
          createRoute({ 
            path: "services", 
            element: <Services /> 
          }),
          createRoute({ 
            path: "bookings", 
            element: <Bookings /> 
          }),
          createRoute({ 
            path: "availability", 
            element: <Availability /> 
          }),
          createRoute({ 
            path: "book", 
            element: <BookService /> 
}),
createRoute({ 
            path: "booking-config", 
            element: <BookingConfiguration /> 
          }),
createRoute({ 
            path: "config/:slug", 
            element: <BookingConfiguration /> 
}),
          createRoute({ 
            path: "config/:slug", 
            element: <BookingConfiguration /> 
          }),
          createRoute({ 
            path: "book/:slug", 
            element: <BookService /> 
          }),
          createRoute({ 
            path: "booking-confirmation/:id", 
            element: <BookingConfirmation /> 
          }),
          createRoute({ 
            path: "*", 
            element: <NotFound /> 
          })
        ]
      },
      // Authentication routes
      createRoute({ path: "/booker/login", element: <BookerLogin /> }),
      createRoute({ path: "/booker/signup", element: <BookerSignup /> }),
      createRoute({ path: "/callback", element: <Callback /> }),
      createRoute({ path: "/error", element: <ErrorPage /> }),
      createRoute({ path: "/access-denied", element: <AccessDenied /> }),
      createRoute({ path: "/prompt-password/:appId/:emailAddress/:provider", element: <PromptPassword /> }),
      createRoute({ path: "/reset-password/:appId/:fields", element: <ResetPassword /> })
    ]
  }
];

export const router = createBrowserRouter(routes);