import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import SplashScreen from './components/layout/SplashScreen';

// Layout & Route Wrappers
import Navbar from './components/layout/Navbar';
import PageWrapper from './components/layout/PageWrapper';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/layout/PrivateRoute';
import GuestRoute from './components/layout/GuestRoute';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import GigDetail from './pages/GigDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Orders from './pages/Orders';
import CreateGig from './pages/CreateGig';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Checkout from './pages/Checkout';

// AuthGate — shows splash screen while checking localStorage
function AuthGate({ children }) {
  const { isLoading } = useAuth();
  if (isLoading) return <SplashScreen />;
  return children;
}

function App() {
  return (
    <AuthGate>
      <PageWrapper>
        <Navbar />
        <div className="flex-1 w-full max-w-7xl mx-auto">
          <Routes>

            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/gig/:id" element={<GigDetail />} />
            <Route path="/profile/:username" element={<Profile />} />

            {/* Guest Only — redirect to dashboard if logged in */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            {/* Protected — redirect to login if not logged in */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/gig/create" element={<CreateGig />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/checkout/:gigId" element={<Checkout />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </div>
        <Footer />
      </PageWrapper>
    </AuthGate>
  );
}

export default App;