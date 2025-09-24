import React, {useLayoutEffect, useRef} from "react";
import "./CustomerLayout.scss";
import { FaFacebookSquare } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { Button, Layout } from "antd";
import Logo from "../../assets/images/logo.jpg";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Dropdown, Menu } from "antd";
import { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import AccountAvatar from "../../components/AccountAvatar";

const { Header, Footer, Content } = Layout;

function CustomerLayout() {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const contentRef = useRef(null);
  useLayoutEffect(() => {
    if (hash) return; // nếu vào anchor (#id) thì giữ hành vi mặc định

    // 1) cuộn window (dù bạn dùng container hay không, cứ làm trước cho chắc)
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 2) cuộn container nếu có
    contentRef.current?.scrollTo(0, 0);

    // 3) double-tick để thắng reflow/lazy load
    const t = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      contentRef.current?.scrollTo(0, 0);
    }, 0);

    return () => clearTimeout(t);
  }, [pathname, hash]);

  const { user, logout } = useAuth();

  const handleLogin = () => {
    navigate("/login"); // điều hướng không reload trang
  };
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleClick = () => {
    navigate("/");
  };

  return (
    <Layout>
      <Header className="Header-Customer">
        <div className="MainContainer">
          <div className="Header-Customer__logo" onClick={handleClick}>
            <img src={Logo} alt="Logo" className="Header-Customer__imgLogo" />
          </div>
          <div className="Header-Customer__Nav">
            <Link to={"/"} className="Header-Customer__NavItem">
              Trang chủ
            </Link>
            <Link to={"/ToiecTests"} className="Header-Customer__NavItem">
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
            {/* <Button className='Header-Customer__btnLogin' onClick={handleLogin}>Đăng nhập</Button> */}
          </div>
        </div>
      </Header>
      <Content ref={contentRef} className="Content-Customer">
        <Outlet />
      </Content>
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
    </Layout>
  );
}
export default CustomerLayout;
