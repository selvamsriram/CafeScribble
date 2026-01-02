import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LandingPage } from '@/pages/Landing';
import { RepoPickerPage } from '@/pages/RepoPicker';
import { DashboardPage } from '@/pages/Dashboard';
import { EditorPage } from '@/pages/EditorPage';
import { Loader2 } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mx-auto mb-3" />
        <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function RequireRepo({ children }: { children: React.ReactNode }) {
  const { selectedRepo, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!selectedRepo) {
    return <Navigate to="/repos" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, selectedRepo, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            selectedRepo ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/repos" replace />
            )
          ) : (
            <LandingPage />
          )
        }
      />
      {/* Protected routes */}
      <Route
        path="/repos"
        element={
          <ProtectedRoute>
            <RepoPickerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RequireRepo>
              <DashboardPage />
            </RequireRepo>
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor/:path"
        element={
          <ProtectedRoute>
            <RequireRepo>
              <EditorPage />
            </RequireRepo>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ThemeProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
