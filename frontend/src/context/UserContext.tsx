import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../api";

interface User {
  id: string;
  email: string;
  name : string;
  role: string;
  avatar_url?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin user từ API khi component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const meResponse = await api.get("/users/me/");
        
        // Fetch avatar from profile endpoint
        let avatarUrl: string | undefined = undefined;
        try {
          const profileResponse = await api.get("/users/profile/");
          avatarUrl = profileResponse.data.avatar_url || undefined;
        } catch (e) {
          // Profile endpoint might not be available, continue without avatar
          console.log("Could not fetch profile data for avatar");
        }
        
        setUser({
          id: meResponse.data.user_id,
          email: meResponse.data.email,
          role: meResponse.data.role,
          name: meResponse.data.name,
          avatar_url: avatarUrl,
        });
      } catch (error) {
        // If there is no token or the token has expired, user will be null
        console.log("Chưa đăng nhập hoặc phiên đã hết hạn");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

// Higher order component to ensure UserProvider is available
export const withUserProvider = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <UserProvider>
      <Component {...props} />
    </UserProvider>
  );
};
