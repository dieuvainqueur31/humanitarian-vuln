import Swal from 'sweetalert2';

export const showAlert = {
  /**
   * Success notification toast or dialog
   */
  success: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 2500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      background: '#0f172a',
      color: '#f8fafc',
      customClass: {
        popup: 'border border-slate-800 shadow-xl rounded-xl',
      },
    });
  },

  /**
   * Action feedback error alert
   */
  error: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'error',
      title,
      text: text || 'An unexpected error occurred. Please try again.',
      confirmButtonText: 'Dismiss',
      confirmButtonColor: '#e11d48',
      background: '#0f172a',
      color: '#f8fafc',
      customClass: {
        popup: 'border border-slate-800 shadow-xl rounded-xl',
        confirmButton: 'px-4 py-2 text-xs font-bold rounded-lg',
      },
    });
  },

  /**
   * Confirmation Modal before major destructive or status-altering actions
   */
  confirm: async (title: string, text: string, confirmButtonText = 'Yes, proceed') => {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0284c7',
      cancelButtonColor: '#475569',
      confirmButtonText,
      background: '#0f172a',
      color: '#f8fafc',
      customClass: {
        popup: 'border border-slate-800 shadow-xl rounded-xl',
        confirmButton: 'px-4 py-2 text-xs font-bold rounded-lg',
        cancelButton: 'px-4 py-2 text-xs font-bold rounded-lg',
      },
    });
    return result.isConfirmed;
  },
};
