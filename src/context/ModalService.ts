let showModalFunction: (
  title: string,
  content: string,
  onConfirm: () => void,
  onCancel?: () => void,
  showCancel?: boolean,
  confirmText?: string,
  cancelText?: string,
  dismissOnBackgroundClick?: boolean,
  position?:  'center' | 'top',
  showBackground?: boolean
) => void;

export const setModalFunctions = (
  showModal: (
    title: string,
    content: string,
    onConfirm: () => void,
    onCancel?: () => void,
    showCancel?: boolean,
    confirmText?: string,
    cancelText?: string,
    dismissOnBackgroundClick?: boolean,
    position?: 'center' | 'top',
    showBackground?: boolean
  ) => void
) => {
  showModalFunction = showModal;
};

export const showModal = (
  title: string,
  content: string,
  onConfirm: () => void,
  onCancel?: () => void,
  showCancel: boolean = true,
    confirmText: string = '확인',
  cancelText: string = '취소',
  dismissOnBackgroundClick: boolean = true,
  position: 'center' | 'top' = 'center',
  showBackground: boolean = true

) => {
  if (showModalFunction) {
    showModalFunction(title, content, onConfirm, onCancel, showCancel,  confirmText, cancelText, dismissOnBackgroundClick , position, showBackground);
  } else {
    console.error('showModal function is not set');
  }
};