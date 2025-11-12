import React from "react";
import CustomerLayout from "../layouts/CustomerLayout";
import AdminLayout from "../layouts/AdminLayout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashBoard from "../pages/DashBoard";
import UserManagement from "../pages/UserManagement";
import BlogManagement from "../pages/BlogManagement";
import ToeicTestManagement from "../pages/ToeicTestManagement";
import PersonalInformation from "../pages/PersonalInformation";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import Register from "../pages/Register";
import Feedback from "../pages/Feedback";
import VocabularyTopic from "../pages/VocabularyTopic";
import ToeicTests from "../pages/ToeicTests";
import Blogs from "../pages/Blogs";
import DetailTopic from "../pages/DetailTopic";
import DetailListFalshCard from "../pages/DetailListFlashCard";
import PracticeFlashCard from "../pages/PracticeFlashCard";
import DetailExam from "../pages/DetailExam";
import PracticeExam from "../pages/PracticeExam";
import BlogCategoryManagent from "../pages/BlogCategoryManagement";
import TestSetManagement from "../pages/TestSetManagement";
import FeedbackManagement from "../pages/FeedbackManagement";
import BlogDetail from "../pages/BlogDetail";
import ResultExam from "../pages/ResultExam";
import ReviewFlashCard from "../pages/ReviewFlashCard";
import ReviewDetailListCard from "../pages/ReviewDetailListCard";
import ReviewExam from "../pages/ReviewExam";
import ScrollToTop from "../components/ScrollToTop";
import { useEffect } from "react";
import Quiz from "../pages/Quiz";
import PikachuPractice from "../pages/PikachuPractice";
import VnpayResult from "../pages/VnpayResult";
import PricingPage from "../pages/PricingPage";
function MainRoutes() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => {
        window.history.scrollRestoration = prev;
      };
    }
  }, []);
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Layout khách hàng */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="Login" element={<Login />} />
          <Route path="ForgotPassword" element={<ForgotPassword />} />
          <Route path="Register" element={<Register />} />
          <Route path="Feedback" element={<Feedback />} />
          <Route path="VocabularyTopics" element={<VocabularyTopic />} />
          <Route path="ToiecTests" element={<ToeicTests />} />
          <Route path="VnpayResult" element={<VnpayResult />} />
          <Route path="Blogs" element={<Blogs />} />
          <Route path="Blogs/BlogDetail/:blogId" element={<BlogDetail />} />
          <Route path="PersonalInformation" element={<PersonalInformation />} />
          <Route
            path="ReviewFlashCard/:topicId"
            element={<ReviewFlashCard />}
          />
          <Route
            path="ReviewFlashCard/ReviewDetailListCard/:flashcardId"
            element={<ReviewDetailListCard />}
          />
          <Route path="ReviewExam/:examReviewId" element={<ReviewExam />} />
          <Route
            path="VocabularyTopics/DetailTopic/:topicId"
            element={<DetailTopic />}
          />
          <Route path="PricingPage/:Id" element={<PricingPage />} />
          <Route
            path="VocabularyTopics/DetailTopic/DetailListFlashCard/:flashcardId"
            element={<DetailListFalshCard />}
          />
          <Route
            path="VocabularyTopics/DetailTopic/DetailListFlashCard/PracticeFlashCard/:flashcardId"
            element={<PracticeFlashCard />}
          />
          <Route
            path="VocabularyTopics/DetailTopic/DetailListFlashCard/MiniGame/:flashcardId"
            element={<PracticeFlashCard />}
          />
          <Route
            path="VocabularyTopics/DetailTopic/DetailListFlashCard/Quiz/:flashcardId"
            element={<Quiz />}
          />
          <Route
            path="VocabularyTopics/DetailTopic/DetailListFlashCard/PikachuPractice/:flashcardId"
            element={<PikachuPractice />}
          />
          <Route path="DetailExam/:id" element={<DetailExam />}>
            <Route path="ResultExam/:resultId" element={<ResultExam />} />
          </Route>
          <Route path="PracticeFlashCard" element={<PracticeFlashCard />} />
          <Route path="PracticeExam/:examId" element={<PracticeExam />} />
        </Route>
        {/* Layout quản trị viên */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashBoard />} />
          <Route path="DashBoard" element={<DashBoard />} />
          <Route path="UserManagement" element={<UserManagement />} />
          <Route path="BlogManagement" element={<BlogManagement />} />
          <Route path="ToeicTestManagement" element={<ToeicTestManagement />} />
          <Route path="PersonalInformation" element={<PersonalInformation />} />
          <Route
            path="BlogCategoryManagement"
            element={<BlogCategoryManagent />}
          />
          <Route path="TestSetManagement" element={<TestSetManagement />} />
          <Route path="FeedbackManagement" element={<FeedbackManagement />} />
        </Route>
        {/* Route cho trang Forbidden*/}
        {/* <Route path="/forbidden" element={<Forbidden />} /> */}
        {/* Trang không tìm thấy */}
        {/* <Route path="*" element={<PageNotFound />} /> */}
      </Routes>
    </>
  );
}
export default MainRoutes;
