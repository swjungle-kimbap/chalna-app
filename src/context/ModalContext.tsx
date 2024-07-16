import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ModalContent {
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  dismissOnBackgroundClick?: boolean;
  position?: 'center' | 'top'
}

interface ModalContextProps {
  modalVisible: boolean;
  modalContent: ModalContent;
  showModal: (
    title: string, 
    content: string, 
    onConfirm: () => void, 
    onCancel?: () => void, 
    showCancel?: boolean,
    confirmText?: string,
    cancelText?: string,
    dismissOnBackgroundClick?: boolean,
    position?: 'center' | 'top'
  ) => void;
  hideModal: () => void;
}

const defaultModalContent: ModalContent = {
  title: '',
  content: '',
  onConfirm: () => {},
  onCancel: undefined,
  confirmText: '확인',
  cancelText: '취소',
  showCancel: true,
  dismissOnBackgroundClick: true,
  position: 'center'
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

  const showModal = (
    title: string, 
    content: string, 
    onConfirm: () => void, 
    onCancel?: () => void, 
    showCancel: boolean = true,
    confirmText: string = '확인',
    cancelText: string = '취소',
    dismissOnBackgroundClick: boolean = true,
     position: 'center' | 'top' = 'center'
  ) => {
    setModalContent({ title, content, onConfirm, onCancel ,  confirmText, cancelText, showCancel , dismissOnBackgroundClick , position});
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
