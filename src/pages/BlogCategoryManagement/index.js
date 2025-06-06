import { useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import "./BlogCategoryManagement.scss";
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
import AddAndEditExam from "../../components/AddAndEditExam";
import AddAndEditCategory from "../../components/AddAndEditCategory";
import {
  DeleteCategoryBlog,
  GetAllCategoryBlogs,
  UpdateCategoryBlog,
} from "../../services/Blog/categoryBlogService";
export default function BlogCategoryManagent() {
  const [open, setOpen] = useState(false); // mở modal
  const [confirmLoading, setConfirmLoading] = useState(false); // loading khi bấm ok trong modal
  const [detailingCategory, setDetailingCategory] = useState(null);
  const [allCategoryBlogs, setAllCategoryBlogs] = useState([]);
  const [listCategoryBlogs, setListCategoryBlogs] = useState([]);
  const [formKey, setFormKey] = useState(Date.now());
  const showModal = (record) => {
    setDetailingCategory(record);
    setOpen(true);
    setFormKey(Date.now());
  };
  const handleOk = (isSucced) => {
    reloadExams();
    setOpen(false);
    setConfirmLoading(false);
    if (isSucced) {
      showSuccess("Thêm danh mục blog thành công!");
    }
  };

  const handleClose = () => {
    setOpen(false);
  };
  const columns = [
    {
      title: "Số thứ tự",
      key: "index",
      // Số thứ tự (STT) nên phản ánh đúng vị trí hiện tại của dòng trên bảng, không phải vị trí gốc trong mảng data.
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên danh mục",
      dataIndex: "title",
      key: "title",
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
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await GetAllCategoryBlogs();

        //đoạn này để fix warning key trong bảng
        const usersWithKey = res.map((user) => ({
          ...user,
          key: user.id,
        }));
        setAllCategoryBlogs(usersWithKey);
        setListCategoryBlogs(usersWithKey);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách danh mục blog:", error);
      }
    };
    fetchUsers();
  }, []);
  const handleDelete = async (Id) => {
    const confirmed = await confirmDelete("Bạn có chắc muốn xóa bộ đề này?");
    if (!confirmed) return;
    try {
      const result = await DeleteCategoryBlog(Id);
      if (!result) {
        return;
      }
      setListCategoryBlogs((prev) =>
        prev.filter((category) => category.id !== Id)
      );
      setAllCategoryBlogs((prev) =>
        prev.filter((category) => category.id !== Id)
      );
      showSuccess("Xóa bộ đề thành công!");
    } catch (error) {
      showErrorMessage("Xóa bộ đề thất bại!");
    }
  };
  const reloadExams = async () => {
    const res = await GetAllCategoryBlogs();
    // Thêm key cho mỗi exam (key = id)
    const CategoryBlogsWithKey = res.map((exam) => ({
      ...exam,
      key: exam.id,
    }));
    setListCategoryBlogs(CategoryBlogsWithKey);
    setAllCategoryBlogs(CategoryBlogsWithKey);
  };
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    if (searchValue) {
      const filteredCategory = allCategoryBlogs.filter((category) =>
        category.title?.toLowerCase().includes(searchValue)
      );
      setListCategoryBlogs(filteredCategory);
    } else {
      setListCategoryBlogs(allCategoryBlogs); // Reset lại danh sách hiển thị
    }
  };
  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  return (
    <div className="CategoryManagement">
      <h2 className="PageTitle">Blog Category Management</h2>
      <div className="CategoryManagement__header">
        <div className="FindInformation">
          <Input
            className="SearchBar SearchBar--size"
            suffix={<SearchOutlined />}
            placeholder="Nhập tên danh mục cần tìm"
            allowClear
            onChange={handleSearch}
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
      <BaseTable
        columns={columns}
        data={listCategoryBlogs}
        onChange={onChange}
      />

      <BaseModal
        open={open}
        onCancel={handleClose}
        title={
          <div style={{ fontSize: 24, fontWeight: "bold" }}>
            {detailingCategory ? "Chi tiết danh mục" : "Thêm danh mục"}
          </div>
        }
      >
        <AddAndEditCategory
          onOK={handleOk}
          confirmLoading={confirmLoading}
          setConfirmLoading={setConfirmLoading}
          initialValues={detailingCategory}
          key={formKey}
          reloadExams={reloadExams}
          // handleUpdateCategoryBlog={handleUpdateCategoryBlog}
          setDetailingCategory={setDetailingCategory}
        />
      </BaseModal>
    </div>
  );
}
