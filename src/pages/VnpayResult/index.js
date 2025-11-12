"use client";

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./VnpayResult.scss";
import { Button, message, Spin } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  PrinterOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { getPaymentByTxnRef } from "../../services/Payment/paymentService";
import { fmtPayDate } from "../../utils/formatData";

const fmtAmount = (v) => {
  if (!v) return "-";
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return v;
  return n.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

export default function VnpayResult() {
  const { txnRef } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const fetchPayment = async () => {
      if (!txnRef) {
        messageApi.error("Không tìm thấy mã giao dịch (txnRef)");
        setLoading(false);
        return;
      }

      try {
        const res = await getPaymentByTxnRef(txnRef);
        console.log("res", res);
        if (res) {
          setData(res);
        }
      } catch (err) {
        messageApi.error(err.message || "Lỗi khi gọi API");
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [txnRef, messageApi]);
  console.log("data", data);

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

            {/* Thêm nội dung thanh toán */}
            <div className="VnpayResult__summary-item">
              <div className="label">Nội dung thanh toán</div>
              <div className="value">{data.description || "-"}</div>
            </div>

            {/* Thêm người thanh toán */}
            <div className="VnpayResult__summary-item">
              <div className="label">Người thanh toán</div>
              <div className="value">{data.userName || "-"}</div>
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
