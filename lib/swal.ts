import Swal from 'sweetalert2';

export const showSuccess = (message: string) => {
  return Swal.fire({
    icon: 'success',
    title: 'Success!',
    text: message,
    confirmButtonColor: '#8566ff',
    background: '#1a1a2e',
    color: '#fff',
  });
};

export const showError = (message: string) => {
  return Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    confirmButtonColor: '#8566ff',
    background: '#1a1a2e',
    color: '#fff',
  });
};

export const showConfirm = async (title: string, text: string) => {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: '#8566ff',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel',
    background: '#1a1a2e',
    color: '#fff',
  });
  return result.isConfirmed;
};

export const showInfo = (message: string) => {
  return Swal.fire({
    icon: 'info',
    title: 'Info',
    text: message,
    confirmButtonColor: '#8566ff',
    background: '#1a1a2e',
    color: '#fff',
  });
};
