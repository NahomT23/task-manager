
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SignUp from './pages/Auth/SignUp'
import SignIn from './pages/Auth/SignIn'
import PrivareRoutes from './routes/PrivareRoute'
import Dashboard from './pages/Admin/Dashboard'
import ManageTasks from './pages/Admin/ManageTasks'
import CreateTask from './pages/Admin/CreateTask'
import ManageUsers from './pages/Admin/ManageUsers'
import UserDashboard from './pages/User/UserDashboard'
import MyTasks from './pages/User/MyTasks'
import ViewTaskDetails from './pages/User/ViewTaskDetails'
import Setup from './pages/setup/Setup'
import { ToastContainer } from 'react-toastify'
import UserDetails from './pages/Admin/UserDetails'

function App() {


  return (
    <div>
      <Router>
        <Routes>
          {/* Redirect from the root path to the login page */}
          <Route path="/" element={<Navigate to="/signin" />} />
          
          <Route path='signin' element={<SignIn />} />
          <Route path='signup' element={<SignUp />} />

          <Route path='/setup' element={<Setup />} />
          
          {/* ADMIN ROUTES */}
        

{/* FIX TYPO, I WROTE PRIVARE INSTEAD OF PRIVATE */}
<Route element={<PrivareRoutes allowedRoles={["admin"]} />}>
  <Route path='/admin/dashboard' element={<Dashboard />} />
  <Route path='/admin/tasks' element={<ManageTasks />} />
  <Route path='/admin/create-task/:taskId?' element={<CreateTask />} />
  <Route path='/admin/users' element={<ManageUsers />} />
  <Route path='/admin/users/:userId' element={<UserDetails />} />
</Route>


          {/* USER ROUTES */}
<Route element={<PrivareRoutes allowedRoles={["member"]} />}>
  <Route path='/user/dashboard' element={<UserDashboard />} />
  <Route path='/user/tasks' element={<MyTasks />} />
  <Route path='/user/task-details/:id' element={<ViewTaskDetails />} />
</Route>

        </Routes>

        <ToastContainer />
      </Router>
    </div>
  )
}

export default App

