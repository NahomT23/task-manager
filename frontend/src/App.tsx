import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import SignUp from './pages/Auth/SignUp';
import SignIn from './pages/Auth/SignIn';
import Dashboard from './pages/Admin/Dashboard';
import ManageTasks from './pages/Admin/ManageTasks';
import CreateTask from './pages/Admin/CreateTask';
import ManageUsers from './pages/Admin/ManageUsers';
import UserDashboard from './pages/User/UserDashboard';
import MyTasks from './pages/User/MyTasks';
import ViewTaskDetails from './pages/User/ViewTaskDetails';
import Setup from './pages/setup/Setup';
import MyProfile from './pages/MyProfile';
import UserDetails from './pages/Admin/UserDetails';
import { ToastContainer } from 'react-toastify';
import PrivateRoutes from './routes/PrivateRoute';
import LandingPage from './components/LandningPage';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          {/* Landing Page as root route */}
          <Route path="/" element={<LandingPage />} />
          
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="setup" element={<Setup />} />

          <Route element={<PrivateRoutes allowedRoles={["admin", "member"]} />}>
            <Route path="profile" element={<MyProfile />} />
          </Route>
          
          {/* ADMIN ROUTES */}
          <Route element={<PrivateRoutes allowedRoles={["admin"]} />}>
            <Route path="admin/dashboard" element={<Dashboard />} />
            <Route path="admin/tasks" element={<ManageTasks />} />
            <Route path="admin/create-task/:taskId?" element={<CreateTask />} />
            <Route path="admin/users" element={<ManageUsers />} />
            <Route path="admin/users/:userId" element={<UserDetails />} />
          </Route>

          {/* USER ROUTES */}
          <Route element={<PrivateRoutes allowedRoles={["member"]} />}>
            <Route path="user/dashboard" element={<UserDashboard />} />
            <Route path="user/tasks" element={<MyTasks />} />
            <Route path="user/task-details/:id" element={<ViewTaskDetails />} />
          </Route>

        </Routes>
        <ToastContainer />
      </Router>
    </div>
  );
}

export default App;