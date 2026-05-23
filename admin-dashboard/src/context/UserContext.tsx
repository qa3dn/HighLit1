import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface UserContextType {
  userName: string;
  userEmail: string;
  userAvatar: string;
  updateUser: (name: string, email: string, avatar: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState<string>("مصطفى أبو عيدة");
  const [userEmail, setUserEmail] = useState<string>("admin@highlit.com");
  const [userAvatar, setUserAvatar] = useState<string>("");

  const updateUser = (name: string, email: string, avatar: string) => {
    setUserName(name);
    setUserEmail(email);
    setUserAvatar(avatar);
  };

  return (
    <UserContext.Provider value={{ userName, userEmail, userAvatar, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
