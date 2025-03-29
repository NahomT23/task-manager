import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom'


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
import { useEffect } from 'react'
import Setup from './pages/setup/Setup'

function App() {
  
  return (
    <div>
      <Router>
        <Routes>
          {/* Redirect from the root path to the login page */}
          <Route path="/" element={<Navigate to="/signin" />} />
          
          <Route path='signin' element={<SignIn />} />
          <Route path='signup' element={<SignUp />} /> {/* Fixed typo here */}

          <Route path='/setup' element={<Setup/>}/>
          
          {/* ADMIN ROUTES */}
          <Route element={<PrivareRoutes allowedRoles={["admin"]}/>}>
            <Route path='/admin/dashboard' element={<Dashboard />} />
            <Route path='/admin/tasks' element={<ManageTasks />} />
            <Route path='/admin/create-task' element={<CreateTask />} />
            <Route path='/admin/users' element={<ManageUsers />} />
          </Route>

          {/* USER ROUTES */}
          <Route element={<PrivareRoutes allowedRoles={["member"]}/>}>
            <Route path='/user/dashboard' element={<UserDashboard />} />
            <Route path='/user/my-tasks' element={<MyTasks />} />
            <Route path='/user/task-details/:id' element={<ViewTaskDetails />} />
          </Route>

           {/* <Route path="/" element={<Root/>} /> */}
        </Routes>
      </Router>
    </div>
  )
}

export default App


// const Root = () => {
//   const { checkAuth, isLoading, isAuthenticated, user } = useAuthStore();

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   if (isLoading) {
//     <Outlet/>
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/signin" />;
//   }

//   return user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/user/dashboard" />

// };

