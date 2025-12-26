import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Snowfall from "./component/ChristmasTheme/Snowfall";
import "./index.css";
// Ensure EnrollmentRequests CSS module is included in the main bundle so
// modal styles are available immediately in production builds.
import "./pages/Admin/EnrollmentRequests/EnrollmentRequests.module.css";
import { router } from "./routes/index.tsx";
import { UserProvider } from "./context/UserContext.tsx";

const RootApp = () => (
  <UserProvider>
    <Snowfall enabled={true} intensity="medium" />
    <RouterProvider router={router} />
  </UserProvider>
);

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <Snowfall enabled={true} intensity="medium" />
    <RouterProvider router={router} />
  </UserProvider>
);
