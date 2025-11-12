import dayjs from "dayjs";
//hàm loại bỏ dấu tiếng việt
export const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD") // tách chữ và dấu
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase(); // về chữ thường luôn
};

export const fmtPayDate = (v) => {
  if (!v) return "-";
  return dayjs(v).format("DD/MM/YYYY");
};
