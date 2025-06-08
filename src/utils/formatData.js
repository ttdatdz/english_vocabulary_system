//hàm loại bỏ dấu tiếng việt
export const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD") // tách chữ và dấu
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase(); // về chữ thường luôn
};
