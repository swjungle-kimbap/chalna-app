let showModalFunction: (
  title: string,
  content: string,
  onConfirm: () => void,
  onCancel?: () => void,
  showCancel?: boolean
) => void;

export const setModalFunctions = (
  showModal: (
    title: string,
    content: string,
    onConfirm: () => void,
    onCancel?: () => void,
    showCancel?: boolean
  ) => void
) => {
  showModalFunction = showModal;
};

export const showModal = (
  title: string,
  content: string,
  onConfirm: () => void,
  onCancel?: () => void,
  showCancel: boolean = true
) => {
  if (showModalFunction) {
    showModalFunction(title, content, onConfirm, onCancel, showCancel);
  } else {
    console.error('showModal function is not set');
  }
};