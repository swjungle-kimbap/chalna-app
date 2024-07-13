import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ModalContent {
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
  showCancel?: boolean;
}

interface ModalContextProps {
  modalVisible: boolean;
  modalContent: ModalContent;
  showModal: (title: string, content: string, onConfirm: () => void, onCancel?: () => void, showCancel?: boolean) => void;
  hideModal: () => void;
}

const defaultModalContent: ModalContent = {
  title: '',
  content: '',
  onConfirm: () => {},
  onCancel: undefined,
  showCancel: true
};

const ModalContext = createContext<ModalContextProps>({
  modalVisible: false,
  modalContent: defaultModalContent,
  showModal: () => {},
  hideModal: () => {},
});

export const useModal = () => {
  return useContext(ModalContext);
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>(defaultModalContent);

  const showModal = (title: string, content: string, onConfirm: () => void, onCancel?: () => void, showCancel: boolean = true) => {
    setModalContent({ title, content, onConfirm, onCancel , showCancel});
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  return (
    <ModalContext.Provider value={{ modalVisible, modalContent, showModal, hideModal }}>
      {children}
    </ModalContext.Provider>
  );
};
