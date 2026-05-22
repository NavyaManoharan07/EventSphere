import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Discover } from "./pages/Discover";
import { EventDetail } from "./pages/EventDetail";
import { Checkout } from "./pages/Checkout";
import { MyTickets } from "./pages/MyTickets";
import { NetworkingHub } from "./pages/NetworkingHub";
import { Communities } from "./pages/Communities";
import { Rewards } from "./pages/Rewards";
import { OrganiserDashboard } from "./pages/OrganiserDashboard";
import { CreateEvent } from "./pages/CreateEvent";
import { CheckIn } from "./pages/CheckIn";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";
import { DashboardLayout } from "./layouts/DashboardLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    path: "/app",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "discover",
        element: <Discover />,
      },
      {
        path: "event/:id",
        element: <EventDetail />,
      },
      {
        path: "checkout/:id",
        element: <Checkout />,
      },
      {
        path: "tickets",
        element: <MyTickets />,
      },
      {
        path: "networking",
        element: <NetworkingHub />,
      },
      {
        path: "communities",
        element: <Communities />,
      },
      {
        path: "rewards",
        element: <Rewards />,
      },
      {
        path: "organiser",
        element: <OrganiserDashboard />,
      },
      {
        path: "create-event",
        element: <CreateEvent />,
      },
      {
        path: "checkin/:eventId",
        element: <CheckIn />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);
