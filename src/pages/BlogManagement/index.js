import { useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import "./BlogManagement.scss";
import { Button, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { IoEye } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import BaseTable from "../../components/BaseTable";
import {
  confirmDelete,
  showErrorMessage,
  showSuccess,
} from "../../utils/alertHelper";
import AddAndEditBlog from "../../components/AddAndEditBlog";
import { DeleteBlog, GetAllBlogs } from "../../services/Blog/blogService";
import { GetAllCategoryBlogs } from "../../services/Blog/categoryBlogService";

export default function BlogManagement() {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [detailingBlog, setDetailingBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [listBlogs, setListBlogs] = useState([]);
  const [formKey, setFormKey] = useState(Date.now());
  const [listCategoryBlogs, setListCategoryBlogs] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const showModal = (record = null) => {
    setDetailingBlog(record);
    setOpen(true);
    setFormKey(Date.now());
  };
  const reloadBlogs = async () => {
    const res = await GetAllBlogs();
    // Thêm key cho mỗi exam (key = id)
    const BlogsWithKey = res.map((blog) => ({
      ...blog,
      key: blog.id,
    }));
    setListBlogs(BlogsWithKey);
    setAllBlogs(BlogsWithKey);
  };
  const handleOk = (isSucced) => {
    reloadBlogs();
    setOpen(false);
    setConfirmLoading(false);
    if (isSucced) {
      showSuccess("Thêm bài blog thành công!");
    }
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleDelete = async (Id) => {
    const confirmed = await confirmDelete("Bạn có chắc muốn xóa bài blog này?");
    if (!confirmed) return;
    try {
      const result = await DeleteBlog(Id);
      if (!result) {
        return;
      }
      setListBlogs((prev) => prev.filter((blog) => blog.id !== Id));
      setAllBlogs((prev) => prev.filter((blog) => blog.id !== Id));
      showSuccess("Xóa bài blog thành công!");
    } catch (error) {
      showErrorMessage("Xóa bài blog thất bại!");
    }
  };
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await GetAllBlogs();
        const BlogsWithKey = res.map((blog) => ({
          ...blog,
          key: blog.id,
        }));
        setAllBlogs(BlogsWithKey);
      } catch (error) {
        showErrorMessage("Lỗi khi lấy danh sách bài blog:", error);
      }
    };
    fetchBlog();
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await GetAllCategoryBlogs();
        const CategoryWithKey = res.map((category) => ({
          ...category,
          key: category.id,
        }));
        setListCategoryBlogs(CategoryWithKey);
      } catch (error) {
        showErrorMessage("Lỗi khi lấy danh sách bộ đề:", error);
      }
    };
    fetchCategory();
  }, []);

  // Lọc dữ liệu dựa trên searchValue và selectedCategory
  useEffect(() => {
    let filtered = allBlogs;

    // Tìm kiếm trên nhiều trường (title, shortDetail)
    if (searchValue) {
      filtered = filtered.filter((blog) =>
        blog.title?.toLowerCase().includes(searchValue)
      );
    }

    // Lọc theo danh mục
    if (selectedCategory !== "All") {
      filtered = filtered.filter((blog) => blog.category === selectedCategory);
    }

    setListBlogs(filtered);
  }, [allBlogs, searchValue, selectedCategory]);

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Tóm tắt ngắn",
      dataIndex: "shortDetail",
      key: "shortDetail",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="Action">
          <IoEye className="Action__Detail" onClick={() => showModal(record)} />
          <MdDelete
            className="Action__Delete"
            onClick={() => handleDelete(record.id)}
          />
        </div>
      ),
    },
  ];

  const handleSearch = (e) => {
    setSearchValue(e.target.value.toLowerCase());
  };

  const handleChange = (value) => {
    setSelectedCategory(value);
  };

  return (
    <div className="BlogManagement">
      <h2 className="PageTitle">Blog Management</h2>
      <div className="BlogManagement__header">
        <div className="FindInformation">
          <Input
            className="SearchBar SearchBar--size"
            suffix={<SearchOutlined />}
            placeholder="Nhập tên bài blog cần tìm"
            allowClear
            onChange={handleSearch}
          />
          <Select
            defaultValue="All"
            placeholder="Lọc theo danh mục"
            onChange={handleChange}
            options={[
              { label: "Tất cả", value: "All" },
              ...listCategoryBlogs.map((category) => ({
                label: category.title,
                value: category.title,
              })),
            ]}
            className="filter"
          />
        </div>
        <Button
          type="primary"
          className="create-topic-button create-topic-button--size"
          onClick={() => showModal(null)}
        >
          + Thêm
        </Button>
      </div>
      <BaseTable columns={columns} data={listBlogs} onChange={() => {}} />

      <BaseModal
        open={open}
        onCancel={handleClose}
        title={
          <div style={{ fontSize: 24, fontWeight: "bold" }}>
            {detailingBlog ? "Chi tiết bài blog" : "Thêm bài blog"}
          </div>
        }
        width={950}
      >
        <AddAndEditBlog
          onOK={handleOk}
          confirmLoading={confirmLoading}
          initialValues={detailingBlog}
          listCategoryBlogs={listCategoryBlogs}
          setConfirmLoading={setConfirmLoading}
          key={formKey}
          reloadBlogs={reloadBlogs}
          setDetailingBlog={setDetailingBlog}
        />
      </BaseModal>
    </div>
  );
}
