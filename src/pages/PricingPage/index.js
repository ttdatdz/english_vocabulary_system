import { useEffect, useState } from "react";
import { showErrorMessage, showWaringMessage } from "../../utils/alertHelper";
import "./PricingPage.scss";
import BaseModal from "../../components/BaseModal";
import {
  checkExpiration,
  createURLPayment,
  validPayments,
} from "../../services/Payment/paymentService";
import { fmtPayDate } from "../../utils/formatData";

export default function PricingPage() {
  const [openUpgradeModal, setOpenUpgradeModal] = useState(false);
  const [billingUnit, setBillingUnit] = useState("month");
  const [quantity, setQuantity] = useState(1);
  const [isPremium, setIsPremium] = useState(false);
  const [expirationDate, setExpirationDate] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const premiumMonthlyPrice = 100000;
  const premiumYearlyPrice = 1000000;

  const pricingPlans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      description: "Hoàn hảo để bắt đầu.",
      features: ["Hỗ trợ cơ bản", "Lưu trữ 5GB", "Cộng đồng hỗ trợ"],
      buttonText: "Bắt đầu miễn phí",
      buttonType: "secondary",
      badge: null,
    },
    {
      id: "premium",
      name: "Premium",
      price: 100000,
      description: "Cho những người muốn nhiều hơn.",
      features: ["Hỗ trợ ưu tiên", "Lưu trữ 1TB", "Tính năng nâng cao"],
      buttonText: "Nâng cấp ngay",
      buttonType: "primary",
      badge: "Được đề xuất",
    },
  ];

  useEffect(() => {
    const fetchStatus = async () => {
      setLoadingStatus(true);
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setIsPremium(false);
          setLoadingStatus(false);
          return;
        }

        const resp = await checkExpiration(userId);
        const hasValid =
          (resp && resp.hasValidPayment) ||
          (resp && resp.data && resp.data.hasValidPayment) ||
          false;

        setIsPremium(Boolean(hasValid));

        const maybeEnd =
          (resp && resp.endDate) ||
          (resp && resp.data && resp.data.endDate) ||
          null;
        if (maybeEnd) setExpirationDate(maybeEnd);
      } catch (err) {
        console.error("Check expiration error:", err);
        setIsPremium(false);
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchStatus();
  }, []);
  useEffect(() => {
    const fetchValidPayments = async () => {
      setLoadingStatus(true);
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          return;
        }

        const resp = await validPayments(userId);
        if (resp.length > 0) {
          // Lấy payment hợp lệ đầu tiên
          const payment = resp[0];
          setExpirationDate(payment.endDate); // gán ngày hết hạn từ API
        } else {
          setExpirationDate(null);
        }
      } catch (err) {
        console.error("Check valid payments error:", err);
        setExpirationDate(null);
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchValidPayments();
  }, []);

  const handleQuantityChange = (e) => {
    const rawValue = e.target.value;
    if (rawValue === "") {
      setQuantity("");
      return;
    }
    const value = parseInt(rawValue, 10);
    if (isNaN(value)) return;
    setQuantity(value);
  };

  const calculateTotal = () => {
    if (quantity < 1) return 0;
    if (billingUnit === "month") return quantity * premiumMonthlyPrice;
    return quantity * premiumYearlyPrice;
  };

  const formatDateDDMMYYYY = (date) =>
    `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;

  const handleContinue = async () => {
    if (quantity === "" || quantity === null) {
      showErrorMessage("Vui lòng không để trống số lượng kỳ hạn");
      return;
    }
    if (quantity < 1) {
      showErrorMessage("Số lượng kỳ hạn phải lớn hơn hoặc bằng 1");
      return;
    }

    const amount = calculateTotal();
    const description = "Nâng cấp Premium " + billingUnit;

    const today = new Date();
    const startDateObj = new Date(today);
    startDateObj.setDate(startDateObj.getDate() + 1);

    const endDateObj = new Date(startDateObj);
    if (billingUnit === "month")
      endDateObj.setMonth(endDateObj.getMonth() + quantity);
    else endDateObj.setFullYear(endDateObj.getFullYear() + quantity);

    const startDate = formatDateDDMMYYYY(startDateObj);
    const endDate = formatDateDDMMYYYY(endDateObj);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        showErrorMessage("Bạn chưa đăng nhập");
        return;
      }

      const checkResp = await checkExpiration(userId);
      const hasValid =
        checkResp?.hasValidPayment || checkResp?.data?.hasValidPayment || false;

      if (hasValid) {
        showWaringMessage(
          "Bạn đã có gói Premium còn hạn, không cần thanh toán thêm!"
        );
        return;
      }

      const payload = { amount, description, startDate, endDate };
      const createResp = await createURLPayment(payload);

      let paymentUrl = null;
      if (typeof createResp === "string") paymentUrl = createResp;
      else
        paymentUrl =
          createResp.data || createResp.url || createResp.response?.data;

      if (!paymentUrl) {
        showErrorMessage("Tạo payment thất bại");
        return;
      }

      window.location.href = paymentUrl;
    } catch (err) {
      console.error(err);
      showErrorMessage("Lỗi kết nối server: " + (err.message || err));
    } finally {
      setOpenUpgradeModal(false);
    }
  };

  const handleCancelUpgrade = () => {
    setQuantity(1);
    setBillingUnit("month");
    setOpenUpgradeModal(false);
  };

  // LOADING
  if (loadingStatus) {
    return (
      <div className="loading-status">
        Đang kiểm tra trạng thái tài khoản...
      </div>
    );
  }

  // PREMIUM UI
  if (isPremium) {
    return (
      <section className="premium-status-container">
        <div className="premium-box">
          <div className="premium-badge">PREMIUM ACCOUNT</div>

          <div className="premium-icon">
            <svg
              width="72"
              height="72"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="12" fill="#FFF2EB" />
              <path
                d="M12 5l2.5 5h5l-4 3.5L17 21l-5-3-5 3 1.5-7.5L5 10h5z"
                fill="#FF6B35"
              />
            </svg>
          </div>

          <h1 className="premium-title">Bạn đang là Premium 🎉</h1>

          <p className="premium-desc">
            Cảm ơn bạn đã nâng cấp — bạn đang tận hưởng đầy đủ tính năng
            Premium.
          </p>

          {expirationDate && (
            <div className="premium-expire-box">
              <div className="premium-expire-title">Thời hạn gói Premium</div>

              <div className="premium-expire-item">
                <strong>Ngày hết hạn:</strong> {fmtPayDate(expirationDate)}
              </div>

              <div className="premium-expire-note">
                Sau ngày này, tài khoản của bạn sẽ tự động trở về gói thường.
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // DEFAULT PRICING UI
  return (
    <section className="pricing">
      <div className="Maincontainer">
        <div className="pricing__header">
          <h1 className="pricing__title">Bảng Giá Đơn Giản</h1>
          <p className="pricing__subtitle">
            Chọn gói phù hợp với nhu cầu của bạn. Nâng cấp hoặc hạ cấp bất kỳ
            lúc nào.
          </p>
        </div>

        <div className="pricing__cards">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`pricing__card ${
                plan.id === "premium" ? "pricing__card--premium" : ""
              }`}
            >
              {plan.badge && (
                <span className="pricing__badge">{plan.badge}</span>
              )}

              <h2 className="pricing__plan-name">{plan.name}</h2>

              <div className="pricing__price">
                <span className="pricing__price__currency">₫</span>
                {plan.price.toLocaleString("vi-VN")}
                {plan.price > 0 && (
                  <span className="pricing__price__period">/tháng</span>
                )}
              </div>

              <p className="pricing__description">{plan.description}</p>

              <ul className="pricing__features">
                {plan.features.map((feature, index) => (
                  <li key={index} className="pricing__feature">
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`pricing__button pricing__button--${plan.buttonType}`}
                onClick={() => {
                  if (plan.id === "premium") setOpenUpgradeModal(true);
                }}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      <BaseModal
        open={openUpgradeModal}
        onCancel={handleCancelUpgrade}
        title={
          <div className="modal-title">Chọn thời hạn nâng cấp Premium</div>
        }
      >
        <div className="modal-section">
          <div className="modal-label">Hình thức:</div>

          <div className="modal-radio-group">
            <label>
              <input
                type="radio"
                value="month"
                checked={billingUnit === "month"}
                onChange={() => setBillingUnit("month")}
              />{" "}
              Theo tháng (100.000đ / tháng)
            </label>

            <label>
              <input
                type="radio"
                value="year"
                checked={billingUnit === "year"}
                onChange={() => setBillingUnit("year")}
              />{" "}
              Theo năm (1.000.000đ / năm)
            </label>
          </div>
        </div>

        <div className="modal-section" style={{ marginTop: 16 }}>
          <label className="modal-label">Số lượng kỳ hạn:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            className="modal-input"
          />
        </div>

        <div className="modal-total">
          Tổng tiền:{" "}
          <span className="modal-total-price">
            {calculateTotal().toLocaleString("vi-VN")}đ
          </span>
        </div>

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={handleCancelUpgrade}>
            Hủy
          </button>
          <button className="modal-btn confirm" onClick={handleContinue}>
            Tiếp tục
          </button>
        </div>
      </BaseModal>
    </section>
  );
}
