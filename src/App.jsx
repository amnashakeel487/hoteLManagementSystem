import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Pending from './pages/Pending';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AllHotels from './pages/admin/AllHotels';
import CleaningTeams from './pages/admin/CleaningTeams';
import PlatformAnalytics from './pages/admin/PlatformAnalytics';
import Notifications from './pages/admin/Notifications';
import Settings from './pages/admin/Settings';
import HotelProfile from './pages/owner/HotelProfile';
import RoomsPricing from './pages/owner/RoomsPricing';
import BookingsCalendar from './pages/owner/BookingsCalendar';
import Reviews from './pages/owner/Reviews';
import Analytics from './pages/owner/Analytics';
import CleaningService from './pages/owner/CleaningService';
import OwnerSettings from './pages/owner/OwnerSettings';

import ExploreHotels from './pages/public/ExploreHotels';
import HotelDetail from './pages/public/HotelDetail';
import BookingConfirmation from './pages/public/BookingConfirmation';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Landing />} />
        <Route path="/explore" element={<ExploreHotels />} />
        <Route path="/hotels" element={<ExploreHotels />} />
        <Route path="/hotel/:id" element={<HotelDetail />} />
        <Route path="/booking-confirmed/:id" element={<BookingConfirmation />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pending" element={<Pending />} />
        <Route 
          path="/owner" 
          element={
            <ProtectedRoute allowedRoles={['hotel_owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/owner/profile" 
          element={
            <ProtectedRoute allowedRoles={['hotel_owner']}>
              <HotelProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/owner/rooms" 
          element={
            <ProtectedRoute allowedRoles={['hotel_owner']}>
              <RoomsPricing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/owner/bookings" 
          element={
            <ProtectedRoute allowedRoles={['hotel_owner']}>
              <BookingsCalendar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/owner/reviews" 
          element={
            <ProtectedRoute allowedRoles={['hotel_owner']}>
              <Reviews />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/owner/analytics" 
          element={
            <ProtectedRoute allowedRoles={['hotel_owner']}>
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/owner/cleaning" 
          element={
            <ProtectedRoute allowedRoles={['hotel_owner']}>
              <CleaningService />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/owner/settings" 
          element={
            <ProtectedRoute allowedRoles={['hotel_owner']}>
              <OwnerSettings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/hotels" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AllHotels />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/cleaning" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CleaningTeams />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PlatformAnalytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/notifications" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Notifications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </PageTransition>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}