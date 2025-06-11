import { Col, Input, Pagination, Row } from "antd";
import SelectField from "../../components/SelectField";
import { SearchOutlined } from "@ant-design/icons";
import "./Blogs.scss";
import CardItemBlog from "../../components/CardItemBlog";
import { useEffect, useState } from "react";
import { get } from '../../utils/request'

export default function Blogs() {
  const [categoryList, setCategoryList] = useState([]);
  const [blogList, setBlogList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchKeyword, setSearchKeyword] = useState("");

  const popularBlogList = blogList.slice(0, 5);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleChange = (value) => {
    setSelectedCategory(value);
  };

  const loadListBlog = async () => {
    const data = await get("api/blog/getAll");
    if (data) {
      setBlogList(data);
      console.log(data);
    }
  }
  const loadCategoryList = async () => {
    const data = await get("api/blog/category/getAll");
    if (data) {
      const formatted = [
        { title: "Tất cả", id: null }
        , ...data
      ];
      setCategoryList(formatted);
    }
  }

  const filteredBlogs = blogList.filter(blog => {
    const matchCategory = selectedCategory === "Tất cả" || blog.category === selectedCategory;
    const matchSearch = blog.title.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchCategory && matchSearch;
  });

  useEffect(() => {
    loadCategoryList();
    loadListBlog();
  }, [])

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
                  options={categoryList.map(c => ({ label: c.title, value: c.title }))}
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
                    placeholder="Nhập tên bài viết"
                    allowClear
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
              </div>

              <div className="blogs__list">
                {filteredBlogs
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((item) => (
                    <CardItemBlog key={`main-${item.id}`} item={item} />
                  ))}
              </div>

              <div className="blogs__pagination">
                <Pagination
                  style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredBlogs.length}
                  onChange={page => setCurrentPage(page)}
                />
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
