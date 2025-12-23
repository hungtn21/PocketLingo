import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./routes/index.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { UserProvider } from "./context/UserContext.tsx";
import Snowfall from "./component/ChristmasTheme/Snowfall";

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
