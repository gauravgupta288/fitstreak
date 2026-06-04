import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddWorkout from './pages/AddWorkout';
import History from './pages/History';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import './App.css';

// App Layout Wrapper to provide a premium simulated phone aspect-ratio on larger desktop screens
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black flex justify-center items-start">
      <div className="w-full max-w-md min-h-screen bg-gym-dark shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col relative border-x border-gym-border/30">
        <Header />
        <main className="flex-grow overflow-y-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Gym Tracking Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add" element={<AddWorkout />} />
                <Route path="/edit/:id" element={<AddWorkout />} />
                <Route path="/history" element={<History />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
