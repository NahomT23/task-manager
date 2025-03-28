import {
  BrowserRouter as Router,
  Routes,
  Route

} from 'react-router-dom'

import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'

import PrivareRoutes from './routes/PrivareRoute'

import Dashboard from './pages/Admin/Dashboard'
import ManageTasks from './pages/Admin/ManageTasks'
import CreateTask from './pages/Admin/CreateTask'
import ManageUsers from './pages/Admin/ManageUsers'

import UserDashboard from './pages/User/UserDashboard'
import MyTasks from './pages/User/MyTasks'
import ViewTaskDetails from './pages/User/ViewTaskDetails'


function App() {
  
  return (
    <div>
      <Router>
        <Routes>
          <Route path='login' element={<Login/>} />
          <Route path='singup' element={<SignUp/>} />

          {/* ADMIN ROUTES */}

          <Route element={<PrivareRoutes allowedRoles={["admin"]}/>}>
          <Route path='/admin/dashboard' element={<Dashboard/>} />
          <Route path='/admin/tasks' element={<ManageTasks/>} />
          <Route path='/admin/create-task' element={<CreateTask/>} />
          <Route path='/admin/users' element={<ManageUsers/>} />
          </Route>

          {/* USER ROUTES */}

          <Route element={<PrivareRoutes allowedRoles={["user"]}/>}>
          <Route path='/user/dashboard' element={<UserDashboard/>} />
          <Route path='/user/my-tasks' element={<MyTasks/>} />
          <Route path='/user/task-details/:id' element={<ViewTaskDetails/>} />
          <Route path='/admin/users' element={<ManageUsers/>} />
          </Route>

        </Routes>
      </Router>
    </div>
  )
}

export default App
