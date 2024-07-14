let showModalFunction: (
  title: string,
  content: string,
  onConfirm: () => void,
  onCancel?: () => void,
  showCancel?: boolean,
  confirmText?: string,
  cancelText?: string
) => void;

export const setModalFunctions = (
  showModal: (
    title: string,
    content: string,
    onConfirm: () => void,
    onCancel?: () => void,
    showCancel?: boolean,
    confirmText?: string,
    cancelText?: string
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
  cancelText: string = '취소'
) => {
  if (showModalFunction) {
    showModalFunction(title, content, onConfirm, onCancel, showCancel,  confirmText, cancelText);
  } else {
    console.error('showModal function is not set');
  }
};