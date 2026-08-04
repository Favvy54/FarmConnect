import toast from 'react-hot-toast';

const notify = {
  success(message) {
    toast.success(message);
  },

  error(message) {
    toast.error(message);
  },

  loading(message) {
    return toast.loading(message);
  },

  dismiss(id) {
    toast.dismiss(id);
  },

  promise(promise, messages) {
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },
};

export default notify;
