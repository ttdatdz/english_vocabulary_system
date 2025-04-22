import React from 'react';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function MainRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Layout khách hàng */}
                <Route path="/" element={<CustomerLayout />}>

                </Route>
                {/* Layout quản trị viên */}
                <Route path="/admin" element={<AdminLayout />}>
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