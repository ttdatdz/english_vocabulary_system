import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./CustomerLayout.scss";
import { FaFacebookSquare } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { Button, Layout } from "antd";
import Logo from "../../assets/images/logo.jpg";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import AccountAvatar from "../../components/AccountAvatar";

const { Header, Footer, Content } = Layout;

function CustomerLayout() {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const contentRef = useRef(null);

  // ===== NEW: overlay loading =====
  const [overlay, setOverlay] = useState({ open: false, text: "" });
  const overlayTimerRef = useRef(null);

  // ===== NEW: header height để overlay phủ dưới menu =====
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // ===== NEW: track previous pathname =====
  const prevPathRef = useRef(pathname);

  const DRAFT_KEY = "toeic:draftExam";
  const OVERLAY_MS = 1000;

  const clearDraftOnly = () => {
    localStorage.removeItem(DRAFT_KEY);
    try {
      // nếu bạn đang dùng window.__toeicExamData để cache, xoá luôn cho sạch
      if (window.__toeicExamData) delete window.__toeicExamData;
    } catch (_) {}
  };

  const isCreateToeicExamPath = (p) => p === "/CreateToeicExam";
  const isPartDetailPath = (p) =>
    p.startsWith("/PartDetail/") || p.startsWith("/PartDetailGroup/");

  const showOverlay = (text) => {
    // clear timer cũ nếu có
    if (overlayTimerRef.current) {
      clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
    }

    setOverlay({ open: true, text });

    overlayTimerRef.current = setTimeout(() => {
      setOverlay({ open: false, text: "" });
      overlayTimerRef.current = null;
    }, OVERLAY_MS);
  };

  // ===== Scroll to top giữ nguyên logic cũ =====
  useLayoutEffect(() => {
    if (hash) return;

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    contentRef.current?.scrollTo(0, 0);

    const t = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      contentRef.current?.scrollTo(0, 0);
    }, 0);

    return () => clearTimeout(t);
  }, [pathname, hash]);

  // ===== NEW: đo header height =====
  useLayoutEffect(() => {
    const measure = () => {
      const h = headerRef.current?.getBoundingClientRect?.().height || 0;
      setHeaderHeight(h);
    };
    measure();

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // ===== NEW: theo dõi đổi route để show overlay + clear draft =====
  useEffect(() => {
    const prev = prevPathRef.current;
    const curr = pathname;

    // (1) Vừa vào CreateToeicExam:
    // chỉ show "Đang tạo đề thi..." khi chưa có draft trong localStorage
    if (!isCreateToeicExamPath(prev) && isCreateToeicExamPath(curr)) {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) {
        showOverlay("Đang tạo đề thi...");
      }
    }

    // (2) Rời CreateToeicExam:
    // Nếu đi sang PartDetail/PartDetailGroup => KHÔNG clear, KHÔNG overlay leave
    if (isCreateToeicExamPath(prev) && !isCreateToeicExamPath(curr)) {
      if (!isPartDetailPath(curr)) {
        showOverlay("Đã tự động lưu đề thi vào hệ thống...");
        clearDraftOnly();
      }
    }

    prevPathRef.current = curr;

    // cleanup timer khi unmount
    return () => {
      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = null;
      }
    };
  }, [pathname]);

  const { user } = useAuth();

  const handleLogin = () => {
    navigate("/Login");
  };

  const handleLogout = () => {
    // giữ behavior cũ của bạn: logout thì clear toàn bộ
    localStorage.clear();
    navigate("/Login");
  };

  const handleClickLogo = () => {
    navigate("/");
  };

  return (
    <Layout>
      <Header ref={headerRef} className="Header-Customer">
        <div className="MainContainer">
          <div className="Header-Customer__logo" onClick={handleClickLogo}>
            <img src={Logo} alt="Logo" className="Header-Customer__imgLogo" />
          </div>
          <div className="Header-Customer__Nav">
            <Link to={"/"} className="Header-Customer__NavItem">
              Trang chủ
            </Link>
            <Link to={"/ToeicTests"} className="Header-Customer__NavItem">
              Luyện thi
            </Link>
            <Link to={"/VocabularyTopics"} className="Header-Customer__NavItem">
              Flashcards
            </Link>
            <Link to={"/Blogs"} className="Header-Customer__NavItem">
              Blog
            </Link>
            <Link to={"/Feedback"} className="Header-Customer__NavItem">
              Đánh giá
            </Link>

            {user ? (
              <AccountAvatar />
            ) : (
              <Button
                className="Header-Customer__btnLogin"
                onClick={handleLogin}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </Header>

      {/* ===== NEW: Overlay loading dưới menu ===== */}
      {overlay.open && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            top: headerHeight || 0,
            bottom: 0,
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(2px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "all",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "18px 22px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            {overlay.text}
          </div>
        </div>
      )}

      <Content ref={contentRef} className="Content-Customer">
        <Outlet />

        <Footer className="Footer-Customer">
          <div className="MainContainer">
            <div className="Header-Customer__logo">
              <img src={Logo} alt="Logo" className="Header-Customer__imgLogo" />
            </div>
            <div className="Footer-Customer__aboutUs">
              <h2 className="Footer-Customer__aboutUs-title">Về chúng tôi</h2>
              <Link className="Footer-Customer__aboutUs-item">Giới thiệu</Link>
              <Link className="Footer-Customer__aboutUs-item">Liên hệ</Link>
            </div>
            <div className="Footer-Customer__policies">
              <h2 className="Footer-Customer__policies-title">Chính sách</h2>
              <Link className="Footer-Customer__policies-item">Điều khoản</Link>
              <Link className="Footer-Customer__policies-item">
                Quyền riêng tư
              </Link>
            </div>
            <div className="Footer-Customer__contactUs">
              <h2 className="Footer-Customer__contactUs-title">
                Liên hệ với chúng tôi
              </h2>
              <div className="Footer-Customer__Container-contactUs-item">
                <Link className="Footer-Customer__contactUs-item">
                  <FaFacebookSquare className="Footer-Customer__iconFB" />
                </Link>
                <Link className="Footer-Customer__contactUs-item">
                  <SiGmail style={{ color: "red" }} />
                </Link>
              </div>
            </div>
          </div>
        </Footer>
      </Content>
    </Layout>
  );
}

export default CustomerLayout;
