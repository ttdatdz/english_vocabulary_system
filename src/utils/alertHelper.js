import Swal from "sweetalert2";

export const confirmDelete = async (title = "Bạn có chắc muốn xóa?") => {
  const result = await Swal.fire({
    title,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xoá",
    cancelButtonText: "Hủy",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    allowOutsideClick: false,
  });
  return result.isConfirmed;
};

export const confirmBasic = async (title = "Xác nhận thao tác?") => {
  const result = await Swal.fire({
    title,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Xác nhận",
    cancelButtonText: "Hủy",
    confirmButtonColor: "Green",
    cancelButtonColor: "#3085d6",
    allowOutsideClick: false,
  });
  return result.isConfirmed;
};

export const showSuccess = (text = "Thành công!") => {
  Swal.fire({
    icon: "success",
    title: text,
    // timer: 3500,
    // showConfirmButton: false,
    allowOutsideClick: false,
  });
};
export const showErrorMessage = (message = "Đã xảy ra lỗi!") => {
  Swal.fire({
    icon: "error",
    title: "Lỗi",
    text: message,
    confirmButtonText: "Đóng",
  });
};

export const showWaringMessage = (message = "Đã xảy ra lỗi!") => {
  Swal.fire({
    icon: "warning",
    title: "Cảnh báo",
    text: message,
    confirmButtonText: "Đóng",
  });
};
