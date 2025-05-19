import React from 'react';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashBoard from '../pages/DashBoard';
import UserManagement from '../pages/UserManagement';
import BlogManagement from '../pages/BlogManagement';
import ToeicTestManagement from '../pages/ToeicTestManagement';
import PersonalInformation from '../pages/PersonalInformation';
import Home from '../pages/Home';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import Register from '../pages/Register';
import Feedback from '../pages/Feedback';
import VocabularyTopic from '../pages/VocabularyTopic';

function MainRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Layout khách hàng */}
                <Route path="/" element={<CustomerLayout />}>
                    <Route index element={<Home />} />
                    <Route path='Login' element={<Login />} />
                    <Route path='ForgotPassword' element={<ForgotPassword />} />
                    <Route path='Register' element={<Register />} />
                    <Route path='Feedback' element={<Feedback />} />
                    <Route path='VocabularyTopics' element={<VocabularyTopic />} />
                </Route>
                {/* Layout quản trị viên */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<DashBoard />} />
                    <Route path='DashBoard' element={<DashBoard />} />
                    <Route path='UserManagement' element={<UserManagement />} />
                    <Route path='BlogManagement' element={<BlogManagement />} />
                    <Route path='ToeicTestManagement' element={<ToeicTestManagement />} />
                    <Route path='PersonalInformation' element={<PersonalInformation />} />
                </Route>
                {/* Route cho trang Forbidden*/}
                {/* <Route path="/forbidden" element={<Forbidden />} /> */}
                {/* Trang không tìm thấy */}
                {/* <Route path="*" element={<PageNotFound />} /> */}
            </Routes>
        </BrowserRouter>
    );
}
export default MainRoutes;