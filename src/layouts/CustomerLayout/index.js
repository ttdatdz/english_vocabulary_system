import React from 'react';
import './CustomerLayout.scss';
import { Button, Flex, Layout } from 'antd';
import Logo from '../../assets/images/logo.jpg';
import { Link } from 'react-router-dom';
import SwiperBanner from '../../components/SwiperBanner';

const { Header, Footer, Content } = Layout;
function CustomerLayout() {
    return (
        <Layout >
            <Header className='Header-Customer' >
                <div className='Header-Customer__logo'>
                    <img src={Logo} alt="Logo" className='Header-Customer__imgLogo' />
                </div>
                <div className='Header-Customer__Nav'>
                    <Link className='Header-Customer__NavItem'>Luyện thi</Link>
                    <Link className='Header-Customer__NavItem'>Flashcards</Link>
                    <Link className='Header-Customer__NavItem'>Lịch học</Link>
                    <Link className='Header-Customer__NavItem'>Blog</Link>
                    <Link className='Header-Customer__NavItem'>Đánh giá</Link>
                    <Button className='Header-Customer__btnLogin'>Đăng nhập</Button>
                </div>
            </Header>
            <Content className='Content-Customer'>
                <SwiperBanner />
            </Content>
            <Footer className='Footer-Customer'>Footer</Footer>
        </Layout>
    );
}
export default CustomerLayout;