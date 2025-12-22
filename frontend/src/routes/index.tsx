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
import LessonManagement from "../pages/Admin/LessonManagement";
import Quiz from "../pages/User/Quiz/Quiz";
import QuizResult from "../pages/User/QuizResult/QuizResult";
import UserList from "../pages/Admin/UserList/UserList";
import AdminList from "../pages/Admin/Admins/AdminList";
import FlashcardStudy from "../pages/User/StudySession/StudySession";
import UserProfile from "../pages/User/Profile/UserProfile";
import UserChangePassword from "../pages/User/ChangePassword/UserChangePassword";
import MyCourses from "../pages/User/MyCourses/MyCourses";
import DailyReview from "../pages/User/DailyReview/DailyReview";
import CourseList from "../pages/Admin/CourseList/CourseList";
import AdminCourseDetail from "../pages/Admin/CourseDetail/AdminCourseDetail";
import EnrollmentRequests from "../pages/Admin/EnrollmentRequests/EnrollmentRequests";
import UserDetail from "../pages/Admin/UserDetail/UserDetail";
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
      { path: "daily-review", element: <DailyReview /> },
      { path: "lessons/:lessonId", element: <LessonDetail /> },
      { path: "lessons/:lessonId/learn", element: <FlashcardStudy /> },
      { path: "study-session", element: <FlashcardStudy /> },
      { path: "lessons/:lessonId/quiz", element: <Quiz /> },
      { path: "quiz-result/:attemptId", element: <QuizResult /> },
      { 
        path: "courses/:courseId", 
        element: <CourseDetail /> 
      },
      { path: "profile", element: <UserProfile /> },
      { path: "change-password", element: <UserChangePassword /> },
      { path: "my-courses", element: <MyCourses /> },
      // Thêm các routes khác cho role learner ở đây
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
      {
        path: "learners",
        element: <UserList />,
      },
      {
        path: "learners/:learnerId",
        element: <UserDetail />,
      },
      {
        path: "admins",
        element: <AdminList />,
      },
      {
        path: "courses",
        element: <CourseList />,
      },
      {
        path: "courses/:courseId",
        element: <AdminCourseDetail />,
      },
      {
        path: "enrollments",
        element: <EnrollmentRequests />,
      },
      {
        path: "lessons/:lessonId/manage",
        element: <LessonManagement />,
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
