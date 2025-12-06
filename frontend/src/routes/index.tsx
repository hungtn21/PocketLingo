import { createBrowserRouter } from "react-router-dom";
import Homepage from "../pages/User/Homepage/Homepage";
import CourseDetail from "../pages/User/CourseDetail/CourseDetail";
import LandingPage from "../pages/Guest/LandingPage";
import LoginPage from "../pages/Guest/LoginPage";
import SignupPage from "../pages/Guest/SignupPage";
import SetPasswordPage from "../pages/Guest/SetPasswordPage";
import ResetPasswordPage from "../pages/Guest/ResetPasswordPage";
import ForgotPasswordPage from "../pages/Guest/ForgotPasswordPage";
import VerifyEmailChangePage from "../pages/Guest/VerifyEmailChangePage";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import LessonDetail from "../pages/User/LessonDetail/LessonDetail";
import AdminProfile from "../pages/Admin/Profile/AdminProfile";
import Quiz from "../pages/User/Quiz/Quiz";
import QuizResult from "../pages/User/QuizResult/QuizResult";
// Định nghĩa tất cả các routes của ứng dụng ở đây
export const router = createBrowserRouter([
  // Routes dành cho learner
  {
    path: "/",
    element: <ProtectedRoute allowRoles={["learner"]} />,
    children: [
      { 
        path: "", 
        element: <Homepage /> 
      },
      { path: "lessons/:lessonId", element: <LessonDetail /> },
      { path: "lessons/:lessonId/quiz", element: <Quiz /> },
      { path: "quiz-result/:attemptId", element: <QuizResult /> },
      { 
        path: "courses/:courseId", 
        element: <CourseDetail /> 
      },
      // Thêm các routes khác cho role learner ở đây
      // Ví dụ:
      //{path: "profile", element: <ProfilePage />}  "/profile"
    ],
  },
  //Routes dành cho admin
   {
    path: "/admin",
    element: <ProtectedRoute allowRoles={["admin", "superadmin"]} />,
    children: [
      {
        path: "",
        element: <AdminDashboard />,
      },
      {
        path: "profile",
        element: <AdminProfile />,
      },
      // Thêm các routes khác cho role admin ở đây
      // Ví dụ: 
      // { path: "dashboard", element: <AdminDashboard /> }, // "/admin/dashboard"
    ],
  },
  // Routes công khai (không cần login)
  {
    path: "/landing",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element:<SignupPage />,
  },
  {
    path: "/set-password",
    element: <SetPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/verify-email-change",
    element: <VerifyEmailChangePage />,
  },
]);
