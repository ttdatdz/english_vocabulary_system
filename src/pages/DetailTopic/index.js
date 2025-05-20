import "./DetailTopic.scss";
import { Tabs } from 'antd';
import { useState } from "react";
import ListFlashCardOfTab from "../../components/ListFlashCardOfTab";

const { TabPane } = Tabs;

export default function DetailTopic() {
    const myVocabList = [
        { id: 1, title: 'TOEIC Vocab ETS 2024 - Listening' },
        { id: 2, title: 'TOEIC Vocab ETS 2024 - Listening' },
        { id: 3, title: 'TOEIC Vocab ETS 2024 - Listening' },
        { id: 4, title: 'TOEIC Vocab ETS 2024 - Listening' },
        { id: 5, title: 'TOEIC Vocab ETS 2024 - Listening' },
    ];

    const studyingList = [
        { id: 6, title: 'TOEIC Vocab ETS 2024 - Reading' },
        { id: 7, title: 'TOEIC Vocab ETS 2024 - Part 5' },
        { id: 8, title: 'TOEIC Vocab ETS 2024 - Part 5' },
        { id: 9, title: 'TOEIC Vocab ETS 2024 - Part 5' },
        { id: 10, title: 'TOEIC Vocab ETS 2024 - Part 5' },
    ];

    const exploreList = [
        { id: 11, title: 'Business English Basics' },
        { id: 12, title: 'IELTS Common Topics' },
        { id: 13, title: 'IELTS Common Topics' },
        { id: 14, title: 'IELTS Common Topics' },
        { id: 15, title: 'IELTS Common Topics' },
    ];

    const [activeTab, setActiveTab] = useState('1');

    const renderFlashcardList = () => {
        switch (activeTab) {
            case '1':
                return <ListFlashCardOfTab list={myVocabList} activeTab={1} />;
            case '2':
                return <ListFlashCardOfTab list={studyingList} activeTab={2} />;
            case '3':
                return <ListFlashCardOfTab list={exploreList} activeTab={3} />;
            default:
                return [];
        }
    };

    return (
        <div className="DetailTopic-page">
            <div className="DetailTopic-page__header">
                <div className="MainContainer">
                    <h2 className="DetailTopic-page__header-title">📖 FlashCards</h2>
                    <Tabs defaultActiveKey="1" onChange={setActiveTab}>
                        <TabPane tab="Danh sách từ vựng" key="1" />
                        <TabPane tab="Đang học" key="2" />
                        <TabPane tab="Khám phá" key="3" />
                    </Tabs>
                </div>
            </div>

            <div className="MainContainer">
                <div className="DetailTopic-page__listFlashcards">{renderFlashcardList()}</div>
            </div>
        </div>
    );
}
