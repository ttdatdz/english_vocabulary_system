"use client";

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./VnpayResult.scss";
import { Button, message } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  PrinterOutlined,
  HomeOutlined,
} from "@ant-design/icons";

const parseSearch = (search) => {
  const params = new URLSearchParams(search);
  const out = {};
  for (const p of params.keys()) out[p] = params.get(p);
  return out;
};

const fmtAmount = (v) => {
  if (!v) return "-";
  const n = Number.parseInt(v, 10);
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
  const [messageApi, contextHolder] = message.useMessage();
  const data = React.useMemo(
    () => parseSearch(location.search),
    [location.search]
  );

  const isSuccess =
    data.status === "success" ||
    data.vnp_ResponseCode === "00" ||
    data.vnp_ResponseCode === "0";

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    messageApi.success(`Copied ${label} to clipboard`);
  };

  return (
    <>
      {contextHolder}
      <div className="VnpayResult">
        <div className="VnpayResult__card">
          <header className="VnpayResult__header">
            <div>
              <h1 className="VnpayResult__title">🛍️ Kết quả thanh toán</h1>
              <div className="VnpayResult__subtitle">Cổng: VNPAY</div>
            </div>

            <div
              className={`VnpayResult__status ${
                isSuccess ? "success" : "failure"
              }`}
            >
              {isSuccess ? (
                <CheckCircleOutlined className="VnpayResult__status-icon" />
              ) : (
                <CloseCircleOutlined className="VnpayResult__status-icon" />
              )}
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
              <div className="value highlight">
                {fmtAmount(data.vnp_Amount)}
              </div>
            </div>
            <div className="VnpayResult__summary-item">
              <div className="label">Mã giao dịch VNPAY</div>
              <div
                className="value copy-item"
                onClick={() =>
                  handleCopy(data.vnp_TransactionNo || "-", "Mã giao dịch")
                }
              >
                {data.vnp_TransactionNo || "-"}
                <CopyOutlined className="copy-icon" />
              </div>
            </div>
            <div className="VnpayResult__summary-item">
              <div className="label">Mã tham chiếu</div>
              <div
                className="value copy-item"
                onClick={() =>
                  handleCopy(data.vnp_TxnRef || "-", "Mã tham chiếu")
                }
              >
                {data.vnp_TxnRef || "-"}
                <CopyOutlined className="copy-icon" />
              </div>
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
            <Button
              type="default"
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
            >
              Trang chủ
            </Button>
            <Button
              type="default"
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
            >
              In hoá đơn
            </Button>
            <Button type="primary" onClick={() => window.location.reload()}>
              Làm mới
            </Button>
          </footer>
        </div>
      </div>
    </>
  );
}
