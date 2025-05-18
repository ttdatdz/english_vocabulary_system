import React from 'react';
import './CustomerLayout.scss';
import { FaFacebookSquare } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { Button, Layout } from 'antd';
import Logo from '../../assets/images/logo.jpg';
import { Link, Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const { Header, Footer, Content } = Layout;
function CustomerLayout() {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login'); // điều hướng không reload trang
    };
    return (
        <Layout >
            <Header className='Header-Customer' >
                <div className="MainContainer">
                    <div className='Header-Customer__logo'>
                        <img src={Logo} alt="Logo" className='Header-Customer__imgLogo' />
                    </div>
                    <div className='Header-Customer__Nav'>
                        <Link className='Header-Customer__NavItem'>Luyện thi</Link>
                        <Link className='Header-Customer__NavItem'>Flashcards</Link>
                        <Link className='Header-Customer__NavItem'>Lịch học</Link>
                        <Link className='Header-Customer__NavItem'>Blog</Link>
                        <Link to={"/Feedback"} className='Header-Customer__NavItem'>Đánh giá</Link>
                        <Button className='Header-Customer__btnLogin' onClick={handleLogin}>Đăng nhập</Button>
                    </div>
                </div>
            </Header>
            <Content className='Content-Customer'>
                <Outlet />
            </Content>
            <Footer className='Footer-Customer'>
                <div className='MainContainer'>
                    <div className='Header-Customer__logo'>
                        <img src={Logo} alt="Logo" className='Header-Customer__imgLogo' />
                    </div>
                    <div className='Footer-Customer__aboutUs'>
                        <h2 className='Footer-Customer__aboutUs-title'>Về chúng tôi</h2>
                        <Link className='Footer-Customer__aboutUs-item'>Giới thiệu</Link>
                        <Link className='Footer-Customer__aboutUs-item'>Liên hệ</Link>
                    </div>
                    <div className='Footer-Customer__policies'>
                        <h2 className='Footer-Customer__policies-title'>Chính sách</h2>
                        <Link className='Footer-Customer__policies-item'>Điều khoản</Link>
                        <Link className='Footer-Customer__policies-item'>Quyền riêng tư</Link>
                    </div>
                    <div className='Footer-Customer__contactUs'>
                        <h2 className='Footer-Customer__contactUs-title'>Liên hệ với chúng tôi</h2>
                        <div className='Footer-Customer__Container-contactUs-item'>
                            <Link className='Footer-Customer__contactUs-item'><FaFacebookSquare className='Footer-Customer__iconFB' /></Link>
                            <Link className='Footer-Customer__contactUs-item'><SiGmail style={{ color: 'red' }} /></Link>
                        </div>

                    </div>
                </div>
            </Footer>
        </Layout>
    );
}
export default CustomerLayout;