// BufferContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import {directedChatMessage} from '../interfaces/Chatting.type';

interface BufferContextProps {
    socketMessageBuffer: directedChatMessage[];
    addMessageToBuffer: (message: directedChatMessage) => void;
    clearBuffer: () => void;
}

const BufferContext = createContext<BufferContextProps | undefined>(undefined);

export const BufferProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [socketMessageBuffer, setSocketMessageBuffer] = useState<directedChatMessage[]>([]);

    const addMessageToBuffer = (message: directedChatMessage) => {
        setSocketMessageBuffer(prevBuffer => [...prevBuffer, message]);
    };

    const clearBuffer = () => {
        setSocketMessageBuffer([]);
    };

    return (
        <BufferContext.Provider value={{ socketMessageBuffer, addMessageToBuffer, clearBuffer }}>
            {children}
        </BufferContext.Provider>
    );
};

export const useBuffer = (): BufferContextProps => {
    const context = useContext(BufferContext);
    if (context === undefined) {
        throw new Error('useBuffer must be used within a BufferProvider');
    }
    return context;
};
