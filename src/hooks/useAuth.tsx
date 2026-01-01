import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { AuthService, type GitHubUser } from '@/services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: GitHubUser | null;
  selectedRepo: string | null;
  logout: () => void;
  setSelectedRepo: (repo: string) => void;
  refreshAuth: () => void;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [selectedRepo, setSelectedRepoState] = useState<string | null>(null);

  const checkAuth = useCallback(() => {
    const authenticated = AuthService.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      setUser(AuthService.getUser());
      setSelectedRepoState(AuthService.getSelectedRepo());
    } else {
      setUser(null);
      setSelectedRepoState(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(() => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setSelectedRepoState(null);
  }, []);

  const setSelectedRepo = useCallback((repo: string) => {
    AuthService.setSelectedRepo(repo);
    setSelectedRepoState(repo);
  }, []);

  const refreshAuth = useCallback(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        selectedRepo,
        logout,
        setSelectedRepo,
        refreshAuth,
        isConfigured: AuthService.isConfigured(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
