import "./PricingPage.scss";

export default function PricingPage() {
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

  return (
    <section className="pricing">
      <div className="Maincontainer">
        {/* Header */}
        <div className="pricing__header">
          <h1 className="pricing__title">Bảng Giá Đơn Giản</h1>
          <p className="pricing__subtitle">
            Chọn gói phù hợp với nhu cầu của bạn. Nâng cấp hoặc hạ cấp bất kỳ
            lúc nào.
          </p>
        </div>

        {/* Pricing Cards */}
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
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
