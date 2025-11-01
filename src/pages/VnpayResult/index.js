import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./VnpayResult.scss";
import { Button } from "antd";

const PARAMS_META = [
  {
    key: "vnp_TmnCode",
    label: "Mã merchant",
    desc: "Mã website của merchant trên hệ thống VNPAY",
  },
  {
    key: "vnp_Amount",
    label: "Tổng tiền",
    desc: "Số tiền thanh toán (VNPAY trả về nhân 100 lần)",
  },
  { key: "vnp_BankCode", label: "Ngân hàng", desc: "Mã ngân hàng thanh toán" },
  {
    key: "vnp_BankTranNo",
    label: "Mã giao dịch ngân hàng",
    desc: "Mã giao dịch tại ngân hàng (nếu có)",
  },
  {
    key: "vnp_CardType",
    label: "Phương thức",
    desc: "Loại thẻ/tài khoản (ATM, QRCODE...)",
  },
  {
    key: "vnp_PayDate",
    label: "Thời gian thanh toán",
    desc: "Định dạng yyyyMMddHHmmss",
  },
  {
    key: "vnp_OrderInfo",
    label: "Nội dung thanh toán",
    desc: "Mô tả nội dung thanh toán (không dấu)",
  },
  {
    key: "vnp_TransactionNo",
    label: "Mã giao dịch VNPAY",
    desc: "Mã giao dịch ghi nhận tại hệ thống VNPAY",
  },
  {
    key: "vnp_ResponseCode",
    label: "Mã phản hồi",
    desc: "00 = Thành công",
  },
  {
    key: "vnp_TransactionStatus",
    label: "Trạng thái giao dịch",
    desc: "00 = Giao dịch được thực hiện thành công tại VNPAY",
  },
  {
    key: "vnp_TxnRef",
    label: "Mã tham chiếu",
    desc: "Mã tham chiếu gửi khi tạo yêu cầu",
  },
  {
    key: "vnp_SecureHash",
    label: "Mã kiểm tra (checksum)",
    desc: "Mã kiểm tra dữ liệu (cần validate trước xử lý)",
  },
];

const parseSearch = (search) => {
  const params = new URLSearchParams(search);
  const out = {};
  for (const p of params.keys()) out[p] = params.get(p);
  return out;
};

const fmtAmount = (v) => {
  if (!v) return "-";
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return v;
  return (n / 100).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

const fmtPayDate = (v) => {
  if (!v) return "-";
  const s = String(v);
  if (s.length < 14) return s;
  const yyyy = s.slice(0, 4);
  const MM = s.slice(4, 6);
  const dd = s.slice(6, 8);
  const hh = s.slice(8, 10);
  const mm = s.slice(10, 12);
  const ss = s.slice(12, 14);
  return `${dd}/${MM}/${yyyy} ${hh}:${mm}:${ss}`;
};

const mapResponseText = (code) => {
  if (code == null) return "-";
  if (String(code).padStart(2, "0") === "00") return "Thành công";
  return `Không thành công (Mã ${code})`;
};

export default function VnpayResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = React.useMemo(
    () => parseSearch(location.search),
    [location.search]
  );

  const isSuccess =
    (data.vnp_ResponseCode === "00" || data.vnp_ResponseCode === "0") &&
    (data.vnp_TransactionStatus === "00" || data.vnp_TransactionStatus === "0");

  return (
    <div className="VnpayResult">
      <div className="VnpayResult__card">
        <header className="VnpayResult__header">
          <div>
            <h1 className="VnpayResult__title">Kết quả thanh toán</h1>
            <div className="VnpayResult__subtitle">Kênh: VNPAY</div>
          </div>

          <div
            className={`VnpayResult__status ${
              isSuccess ? "success" : "failure"
            }`}
          >
            <div className="VnpayResult__status-dot" />
            <div className="VnpayResult__status-text">
              {isSuccess
                ? "Thanh toán thành công"
                : "Thanh toán không thành công"}
            </div>
          </div>
        </header>

        <section className="VnpayResult__summary">
          <div className="VnpayResult__summary-item">
            <div className="label">Tổng tiền</div>
            <div className="value">{fmtAmount(data.vnp_Amount)}</div>
          </div>
          <div className="VnpayResult__summary-item">
            <div className="label">Mã giao dịch VNPAY</div>
            <div className="value">{data.vnp_TransactionNo || "-"}</div>
          </div>
          <div className="VnpayResult__summary-item">
            <div className="label">Mã tham chiếu</div>
            <div className="value">{data.vnp_TxnRef || "-"}</div>
          </div>
          <div className="VnpayResult__summary-item">
            <div className="label">Thời gian</div>
            <div className="value">{fmtPayDate(data.vnp_PayDate)}</div>
          </div>
          <div className="VnpayResult__summary-item">
            <div className="label">Ngân hàng</div>
            <div className="value">{data.vnp_BankCode || "-"}</div>
          </div>
          <div className="VnpayResult__summary-item">
            <div className="label">Phương thức</div>
            <div className="value">{data.vnp_CardType || "-"}</div>
          </div>
        </section>
        <footer className="VnpayResult__actions">
          <Button type="default" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
          <Button type="primary" onClick={() => window.location.reload()}>
            Làm mới
          </Button>
        </footer>
      </div>
    </div>
  );
}
