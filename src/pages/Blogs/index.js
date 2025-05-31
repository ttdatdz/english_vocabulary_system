import { Col, Input, Pagination, Row } from "antd";
import SelectField from "../../components/SelectField";
import { SearchOutlined } from "@ant-design/icons";
import "./Blogs.scss";
import CardItemBlog from "../../components/CardItemBlog";

export default function Blogs() {
  const categoryList = [
    { value: "Toeic tips", label: "Toeic tips" },
    { value: "Listening skill", label: "Listening skill" },
  ];

  const blogList = [
    {
      id: 1,
      title: "Cách luyện nghe TOEIC hiệu quả cho người mới bắt đầu",
      description:
        "Khám phá các phương pháp luyện nghe TOEIC hiệu quả, giúp bạn cải thiện kỹ năng nghe một cách nhanh chóng và dễ áp dụng.",
      image:
        "https://blog.estudyme.com/wp-content/uploads/2024/02/bang-ipa-1536x865.png",
    },
    {
      id: 2,
      title: "Top 5 bộ đề ETS luyện thi TOEIC chuẩn nhất",
      description:
        "Giới thiệu chi tiết về các bộ đề ETS phổ biến giúp bạn luyện thi TOEIC sát với đề thi thật.",
      image:
        "https://blog.estudyme.com/wp-content/uploads/2024/04/Estudyme-Cover-1536x865.jpg",
    },
    {
      id: 3,
      title: "Lộ trình học TOEIC 500+ cho người mất gốc",
      description:
        "Nếu bạn đang ở mức bắt đầu hoặc mất gốc, bài viết này sẽ cung cấp cho bạn lộ trình học chi tiết để đạt 500+ TOEIC.",
      image:
        "https://blog.estudyme.com/wp-content/uploads/2024/04/Estudyme-Cover-1536x865.jpg",
    },
    {
      id: 4,
      title: "Tổng hợp từ vựng TOEIC theo chủ đề thường gặp",
      description:
        "Danh sách từ vựng TOEIC theo các chủ đề thường xuất hiện trong đề thi giúp bạn ghi nhớ dễ dàng hơn.",
      image:
        "https://blog.estudyme.com/wp-content/uploads/2024/04/Estudyme-Cover-1536x865.jpg",
    },
    {
      id: 5,
      title: "Chiến thuật làm bài Part 5 TOEIC hiệu quả",
      description:
        "Hướng dẫn cách phân tích và chọn đáp án nhanh chóng trong Part 5 của bài thi TOEIC.",
      image:
        "https://blog.estudyme.com/wp-content/uploads/2024/02/bang-ipa-1536x865.png",
    },
  ];

  const popularBlogList = blogList.slice(0, 3);

  const handleChange = (value) => {
    console.log("Selected:", value);
  };

  return (
    <div className="blogs">
      <div className="blogs__header">
        <div className="MainContainer">
          <h2 className="blogs__title">Blog học từ vựng và luyện thi</h2>
        </div>
      </div>
      <div className="MainContainer">
        <div className="blogs__content">
          <Row gutter={[80]}>
            <Col span={17} className="blogs__main">
              <div className="blogs__filter">
                <SelectField
                  label="Danh mục"
                  defaultValue="Toeic"
                  onChange={handleChange}
                  options={categoryList}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "25px",
                    flex: "1",
                  }}
                >
                  <h3 style={{ marginRight: "20px" }}>Tìm kiếm bài viết</h3>
                  <Input
                    className="blogs__search"
                    suffix={<SearchOutlined />}
                    placeholder="Nhập bài viết"
                    allowClear
                  />
                </div>
              </div>

              <div className="blogs__list">
                {blogList.map((item) => (
                  <CardItemBlog key={`main-${item.id}`} item={item} />
                ))}
              </div>

              <div className="blogs__pagination">
                <Pagination defaultCurrent={1} total={50} />
              </div>
            </Col>

            <Col span={7} className="blogs__sidebar">
              <h2 className="blogs__sidebar-title">Bài viết nổi bật</h2>
              <div className="blogs__popular">
                {popularBlogList.map((item) => (
                  <CardItemBlog key={`popular-${item.id}`} item={item} />
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}
