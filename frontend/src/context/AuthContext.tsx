import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  userName: string | null;
  hasSeenOnboarding: boolean;
  login: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  completeOnboardingState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("access_token"));
  
  const getInitialName = () => {
    const savedToken = localStorage.getItem("access_token");
    if (savedToken) {
      const decoded = decodeJWT(savedToken);
      return decoded?.first_name || "Athlete"; 
    }
    return null;
  };

  const getInitialOnboardingState = () => {
    const savedToken = localStorage.getItem("access_token");
    if (savedToken) {
      const decoded = decodeJWT(savedToken);
      const currentName = decoded?.first_name || "Athlete";
      
      if (localStorage.getItem(`gym_onboarding_done_${currentName}`) === "true") {
        return true;
      }
      
      return decoded?.has_seen_onboarding || false; 
    }
    return false;
  };

  const [userName, setUserName] = useState<string | null>(getInitialName());
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(getInitialOnboardingState());

  const login = (accessToken: string, refreshToken?: string) => {
    localStorage.setItem("access_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
    setToken(accessToken);
    
    const decoded = decodeJWT(accessToken);
    const firstName = decoded?.first_name || "Athlete";
    setUserName(firstName);
    
    const hasLocalOverride = localStorage.getItem(`gym_onboarding_done_${firstName}`) === "true";
    setHasSeenOnboarding(hasLocalOverride || decoded?.has_seen_onboarding || false);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    if (userName) {
      localStorage.removeItem(`gym_onboarding_done_${userName}`);
    }
    setToken(null);
    setUserName(null);
    setHasSeenOnboarding(false);
  };

  const completeOnboardingState = () => {
    setHasSeenOnboarding(true);
    if (userName) {
      localStorage.setItem(`gym_onboarding_done_${userName}`, "true");
    }
  };

  return (
    <AuthContext.Provider value={{ token, userName, hasSeenOnboarding, login, logout, completeOnboardingState }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};