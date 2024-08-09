import './App.css'
import { Link, Routes, Route, BrowserRouter, useLocation } from "react-router-dom";
import { Box } from "@chakra-ui/react"

import NotifsPage from './pages/NotifsPage';
import MeritShop from './pages/MeritShop.jsx';
import AssignPoints from './pages/AssignPoints.jsx';
import LeaderBoard from './pages/LeaderBoard.jsx';
import CoursePage from './pages/CoursePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import CourseStudent from './pages/CourseStudent.jsx';
import AdminCourse from './pages/AdminCourse.jsx';
import AdminCourseDetails from './pages/AdminCourseDetails.jsx';



const App = ({ userType }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login-page';
  const isRootPage = location.pathname === '/';


  return (
    <>

    <div width="100%" className={`main-content ${isLoginPage || isRootPage ? 'login-page' : ''}`}>
      <Box minHeight="calc(100vh - 166px)" >
        <Routes>
          <Route path="/merit-shop" element={<MeritShop userType={userType} />} />
          <Route path="/assign-points" element={<AssignPoints />} />
          <Route path="/assign-points/:studentId" element={<AssignPoints />} />
          <Route path="/leaderboard" element={<LeaderBoard userType={userType} />} />
          <Route path="/course-page" element={<CoursePage userType={userType} />} />
          <Route path="/course-students/:courseId" element={<CourseStudent userType={userType}/>} />
          <Route path="/profile-page" element={<ProfilePage />} />
          <Route path="/profile-page/:userId" element={<ProfilePage userType={userType}/>} />
          <Route path="/login-page" element={<LoginPage />} />
          <Route path="/signup-page" element={<SignupPage />} />
          <Route path="/my-dashboard" element={<UserDashboard userType={userType} />} />
          <Route path="/admin-courses" element={<AdminCourse userType={userType} />} />
          <Route path="/admin/course/:courseId" element={<AdminCourseDetails userType={userType} />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/notifications" element={<NotifsPage userType={userType}/> } />
        </Routes></Box>
    </div>
    </>
  )
}
 
export default App
