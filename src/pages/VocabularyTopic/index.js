import "./VocabularyTopic.scss";
import { Tabs } from "antd";
import { useEffect, useState } from "react";
import ListTopicOfTab from "../../components/ListTopicOfTab";
import { get } from "../../utils/request";
const { TabPane } = Tabs;

export default function VocabularyTopic() {
  const [myVocabList, setMyVocabList] = useState([]);
  const [studyingList, setStudyingList] = useState([]);
  const [exploreList, setExploreList] = useState([]);
  const [newList, setNewList] = useState([]);
  const [reviewList, setReviewList] = useState([]);
  const [masterList, setMasterList] = useState([]);
  const [activeTab, setActiveTab] = useState("1");

  const fetchUserTopics = async () => {
    const userId = localStorage.getItem("userId");
    const data = await get(`/api/flashcard/getTopicsByUser/${userId}`);
    if (data && Array.isArray(data)) {
      setMyVocabList(data);
      setStudyingList(
        data.filter((item) => item.learningStatus === "IN_PROGRESS")
      );
      setNewList(data.filter((item) => item.learningStatus === "NEW"));
      setReviewList(
        data.filter((item) => item.learningStatus === "REVIEW_NEEDED")
      );
      setMasterList(data.filter((item) => item.learningStatus === "MASTERED"));
    }
  };

  useEffect(() => {
    const fetchExploreTopics = async () => {
      try {
        const data = await get("api/flashcard/getTopicPopular");
        if (data && Array.isArray(data)) {
          //console.log(item.userName, localStorage.getItem("accountName"));
          setExploreList(
            data.filter(
              (item) => item.userName !== localStorage.getItem("accountName")
            )
          );
        }
      } catch (error) {
        console.error("Lỗi khi tải chủ đề từ vựng:", error);
      }
    };
    fetchExploreTopics();
    fetchUserTopics();
  }, []);

  const renderTopicList = () => {
    switch (activeTab) {
      case "1":
        return (
          <ListTopicOfTab
            list={myVocabList}
            activeTab={1}
            onTopicCreated={() => {
              fetchUserTopics();
            }}
          />
        );
      case "2":
        return (
          <ListTopicOfTab
            list={studyingList}
            activeTab={2}
            onTopicCreated={() => {
              fetchUserTopics();
            }}
          />
        );
      case "3":
        return (
          <ListTopicOfTab
            list={newList}
            activeTab={3}
            onTopicCreated={() => {
              fetchUserTopics();
            }}
          />
        );
      case "4":
        return (
          <ListTopicOfTab
            list={reviewList}
            activeTab={4}
            onTopicCreated={() => {
              fetchUserTopics();
            }}
          />
        );
      case "5":
        return (
          <ListTopicOfTab
            list={masterList}
            activeTab={5}
            onTopicCreated={() => {
              fetchUserTopics();
            }}
          />
        );
      case "6":
        return (
          <ListTopicOfTab
            list={exploreList}
            activeTab={6}
            onTopicCreated={() => {
              fetchUserTopics();
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="VocabularyTopic-page">
      <div className="VocabularyTopic-page__header">
        <div className="MainContainer">
          <h2 className="VocabularyTopic-page__header-title">📖 Topics</h2>
          <Tabs defaultActiveKey="1" onChange={setActiveTab}>
            <TabPane tab="Chủ đề từ vựng của tôi" key="1" />
            <TabPane tab="Đang học" key="2" />
            <TabPane tab="Mới" key="3" />
            <TabPane tab="Cần xem lại" key="4" />
            <TabPane tab="Đã thành thạo" key="5" />
            <TabPane tab="Khám phá" key="6" />
          </Tabs>
        </div>
      </div>

      <div className="MainContainer">
        <div className="VocabularyTopic-page__listTopic">
          {renderTopicList()}
        </div>
      </div>
    </div>
  );
}
