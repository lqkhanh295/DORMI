import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GuestLayout } from './components/layouts/GuestLayout'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Search } from './pages/Search'
import { RoomDetail } from './pages/RoomDetail'

import { CustomerLayout } from './components/layouts/CustomerLayout'
import { CustomerDashboard } from './pages/customer/CustomerDashboard'
import { Profile } from './pages/customer/Profile'
import { AIMatcher } from './pages/customer/AIMatcher'
import { CustomerAppointments } from './pages/customer/Appointments'
import { Messages, SavedRooms } from './pages/customer/Misc'

import { LandlordLayout } from './components/layouts/LandlordLayout'
import { LandlordDashboard, KYC, CreateRoom, MyRooms, LandlordAppointments, LandlordMessages } from './pages/landlord/LandlordScreens'

import { AdminLayout } from './components/layouts/AdminLayout'
import { AdminDashboard, AdminRooms, AdminUsers, AdminReports, AdminKYC } from './pages/admin/AdminScreens'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/room/:id" element={<RoomDetail />} />
        </Route>
        
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="search" element={<Search />} />
          <Route path="room/:id" element={<RoomDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="matcher" element={<AIMatcher />} />
          <Route path="appointments" element={<CustomerAppointments />} />
          <Route path="saved" element={<SavedRooms />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        <Route path="/landlord" element={<LandlordLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LandlordDashboard />} />
          <Route path="kyc" element={<KYC />} />
          <Route path="create-room" element={<CreateRoom />} />
          <Route path="rooms" element={<MyRooms />} />
          <Route path="appointments" element={<LandlordAppointments />} />
          <Route path="messages" element={<LandlordMessages />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="kyc" element={<AdminKYC />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
