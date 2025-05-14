import Swal from 'sweetalert2'


export const confirmDelete = async (title = 'Bạn có chắc muốn xóa?') => {
    return await Swal.fire({
        title,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xoá',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success",
                allowOutsideClick: false,
            });
        }
    });
};

export const showSuccess = (text = 'Thành công!') => {
    Swal.fire({
        icon: 'success',
        title: text,
        // timer: 3500,
        // showConfirmButton: false,
        allowOutsideClick: false,
    });
};
export const showErrorMessage = (message = 'Đã xảy ra lỗi!') => {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: message,
        confirmButtonText: 'Đóng',

    });
};