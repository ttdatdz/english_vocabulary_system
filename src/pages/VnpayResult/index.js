"use client";

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./VnpayResult.scss";
import { Button, message, Spin } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  PrinterOutlined,
  HomeOutlined,
} from "@ant-design/icons";

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

export default function VnpayResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy txnRef từ query string
  const txnRef = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("txnRef");
  }, [location.search]);

  const isSuccess =
    data?.transactionStatus === "SUCCESS" ||
    data?.responseCode === "00" ||
    data?.responseCode === "0";

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    messageApi.success(`Copied ${label} to clipboard`);
  };

  useEffect(() => {
    if (!txnRef) {
      messageApi.error("Không tìm thấy mã giao dịch (txnRef)");
      setLoading(false);
      return;
    }

    // Gọi API chi tiết giao dịch
    fetch(`/api/payment/${txnRef}`)
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi gọi API");
        return res.json();
      })
      .then((json) => {
        if (json.status !== 200) throw new Error(json.message);
        setData(json.data);
      })
      .catch((err) => {
        messageApi.error(err.message);
      })
      .finally(() => setLoading(false));
  }, [txnRef, messageApi]);

  if (loading) return <Spin tip="Đang tải..." style={{ marginTop: 50 }} />;

  if (!data)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        Không tìm thấy dữ liệu giao dịch
      </div>
    );

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
              <div className="value highlight">{fmtAmount(data.amount)}</div>
            </div>
            <div className="VnpayResult__summary-item">
              <div className="label">Mã giao dịch VNPAY</div>
              <div
                className="value copy-item"
                onClick={() =>
                  handleCopy(data.transactionCode || "-", "Mã giao dịch")
                }
              >
                {data.transactionCode || "-"}
                <CopyOutlined className="copy-icon" />
              </div>
            </div>
            <div className="VnpayResult__summary-item">
              <div className="label">Mã tham chiếu</div>
              <div
                className="value copy-item"
                onClick={() => handleCopy(data.orderId || "-", "Mã tham chiếu")}
              >
                {data.orderId || "-"}
                <CopyOutlined className="copy-icon" />
              </div>
            </div>
            <div className="VnpayResult__summary-item">
              <div className="label">Thời gian</div>
              <div className="value">{fmtPayDate(data.transactionDate)}</div>
            </div>
            <div className="VnpayResult__summary-item">
              <div className="label">Ngân hàng</div>
              <div className="value">{data.bankCode || "-"}</div>
            </div>
            <div className="VnpayResult__summary-item">
              <div className="label">Phương thức</div>
              <div className="value">{data.paymentMethod || "-"}</div>
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
