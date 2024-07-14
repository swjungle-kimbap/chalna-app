import React, { createContext, useContext, useState } from 'react';

// 타입 정의
interface PreviousRoute {
  name: string;
  params: object;
}

interface NavigationContextType {
  previousRoute: PreviousRoute | null;
  setPreviousRoute: (route: PreviousRoute | null) => void;
}

// 기본값 설정
const NavigationContext = createContext<NavigationContextType>({
  previousRoute: null,
  setPreviousRoute: () => {},
});

export const NavigationProvider = ({ children }) => {
  const [previousRoute, setPreviousRoute] = useState<PreviousRoute | null>(null);

  return (
    <NavigationContext.Provider value={{ previousRoute, setPreviousRoute }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = () => useContext(NavigationContext);