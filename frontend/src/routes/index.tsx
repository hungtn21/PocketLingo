import { createBrowserRouter } from "react-router-dom";
import Homepage from "../pages/User/Homepage/Homepage";

// Định nghĩa tất cả các routes của ứng dụng ở đây
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
  },
  // Thêm các routes khác ở đây sau này
  // Ví dụ:
  // {
  //   path: "/login",
  //   element: <LoginPage />,
  // },
  // {
  //   path: "/course/:id",
  //   element: <CourseDetailPage />,
  // },
  // {
  //   path: "/profile",
  //   element: <ProfilePage />,
  // },
]);
