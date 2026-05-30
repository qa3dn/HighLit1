/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface SystemContextType {
    systemName: string;
    setSystemName: (name: string) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [systemName, setSystemName] = useState<string>("HighLit Dashboard");

    return (
        <SystemContext.Provider value={{ systemName, setSystemName }}>
            {children}
        </SystemContext.Provider>
    );
};

export const useSystem = (): SystemContextType => {
    const context = useContext(SystemContext);
    if (context === undefined) {
        throw new Error('useSystem must be used within a SystemProvider');
    }
    return context;
};