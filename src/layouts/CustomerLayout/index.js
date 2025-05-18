import React from 'react';
import './CustomerLayout.scss';
import { FaFacebookSquare } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { Button, Card, Flex, Layout } from 'antd';
import Logo from '../../assets/images/logo.jpg';
import { Link } from 'react-router-dom';
import SwiperBanner from '../../components/SwiperBanner';
import CardItemExam from '../../components/CardItemExam';
import CardItemFlashCard from '../../components/CardItemFlashCard';
import SwiperComment from '../../components/SwiperComment';

const { Header, Footer, Content } = Layout;
function CustomerLayout() {
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
                        <Link className='Header-Customer__NavItem'>Đánh giá</Link>
                        <Button className='Header-Customer__btnLogin'>Đăng nhập</Button>
                    </div>
                </div>
            </Header>


            <Content className='Content-Customer'>
                <SwiperBanner />
                <div className="MainContainer">
                    <div className='Container-listExams'>
                        <h2 className='Container-listExams__Title'>Bộ đề thi mới nhất</h2>
                        <div className='Container-listExams__listExams'>
                            <CardItemExam />
                            <CardItemExam />
                            <CardItemExam />
                            <CardItemExam />
                            <CardItemExam />
                        </div>
                    </div>

                    <div className='Container-listFlashcards'>
                        <h2 className='Container-listFlashcards__Title'>Bộ từ vựng phổ biến</h2>
                        <div className='Container-listFlashcards__listFlashcards'>
                            <CardItemFlashCard />
                            <CardItemFlashCard />
                            <CardItemFlashCard />
                            <CardItemFlashCard />
                            <CardItemFlashCard />
                        </div>
                    </div>
                    <div className='Container-listComments'>
                        <h2 className='Container-listComments__Title'>Người dùng nói gì về VocaLearn</h2>
                        <SwiperComment />
                    </div>

                </div>

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