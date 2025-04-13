import React, { useEffect, useState } from "react";
import {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../../APIs/blogApi";
import {
  Table,
  Button,
  Upload,
  message,
  Drawer,
  Switch,
  Spin,
  Form,
  Input,
  Popconfirm,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { getBase64 } from "../../utils/ultils";

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [image, setImage] = useState("");
  const [fileList, setFileList] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [form] = Form.useForm();
  const userId = "WINNER"; // giả định cố định

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsTableLoading(true);
    try {
      const response = await getAllBlogs();
      if (response.success && Array.isArray(response.data)) {
        setBlogs(response.data.map((item) => ({ ...item, key: item._id })));
      } else {
        message.error("Không lấy được dữ liệu blog!");
      }
    } catch (error) {
      console.error("Error fetching blogs: ", error);
      message.error("Lỗi tải danh sách bài viết!");
    }
    setIsTableLoading(false);
  };

  const openDrawer = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      form.setFieldsValue({
        title: blog.title,
        content: blog.content,
        isPublished: blog.isPublished,
      });
      setImage(blog.image || "");
      setFileList(blog.image ? [{ url: blog.image }] : []);
    } else {
      setEditingBlog(null);
      form.resetFields();
      setImage("");
      setFileList([]);
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    form.resetFields();
    setImage("");
    setFileList([]);
    setIsDrawerOpen(false);
  };

  const handleSubmit = async (values) => {
    const blogData = { ...values, image, userId };
    try {
      if (editingBlog) {
        await updateBlog(editingBlog._id, blogData);
        message.success("Cập nhật bài viết thành công!");
      } else {
        await createBlog(blogData);
        message.success("Thêm bài viết thành công!");
      }
      handleCloseDrawer();
      fetchBlogs();
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi thêm/cập nhật bài viết!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBlog(id);
      message.success("Xóa bài viết thành công!");
      fetchBlogs();
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi xóa bài viết!");
    }
  };

  const handleImageChange = async ({ fileList }) => {
    if (!fileList.length) {
      setImage("");
      setFileList([]);
      return;
    }

    const file = fileList[0];
    if (file && !file.url && !file.preview) {
      try {
        file.preview = await getBase64(file.originFileObj);
      } catch (error) {
        console.error("Lỗi khi đọc file: ", error);
        message.error("Không thể đọc file ảnh!");
      }
    }
    setImage(file.url || file.preview);
    setFileList([file]);
  };

  const columns = [
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    { title: "Nội dung", dataIndex: "content", key: "content" },
    { title: "Người đăng", dataIndex: "userId", key: "userId" },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (img) =>
        img && <img width={50} height={50} src={img} alt="Ảnh bài viết" />,
    },
    {
      title: "Công khai",
      dataIndex: "isPublished",
      key: "isPublished",
      render: (published) => (published ? "✅" : "❌"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <span>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bài viết này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              style: { backgroundColor: "blue", color: "white", borderRadius: "5px" },
            }}
          >
            <DeleteOutlined
              style={{ color: "red", fontSize: "20px", cursor: "pointer" }}
            />
          </Popconfirm>
          <EditOutlined
            onClick={() => openDrawer(record)}
            style={{
              marginRight: 10,
              cursor: "pointer",
              fontSize: "20px",
              marginLeft: "10px",
              color: "blue",
            }}
          />
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1>Quản lý Blog</h1>
      <Button className="mt-5 bg-blue-500" onClick={() => openDrawer()}>
        Thêm bài viết
      </Button>
      <Spin
        className="mt-9"
        tip="Đang tải dữ liệu..."
        spinning={isTableLoading}
      >
        <Table
          style={{ marginTop: 20 }}
          dataSource={blogs}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Spin>
      <Drawer
        title={editingBlog ? "Cập nhật bài viết" : "Thêm bài viết"}
        placement="right"
        closable
        onClose={handleCloseDrawer}
        open={isDrawerOpen}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Ảnh">
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={handleImageChange}
              showUploadList
            >
              <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
            </Upload>
            {image && (
              <img
                src={image}
                alt="Ảnh xem trước"
                style={{ width: 100, height: 100, marginTop: 10 }}
              />
            )}
          </Form.Item>
          <Form.Item
            name="isPublished"
            label="Hiển thị công khai"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button className="bg-blue-500" block htmlType="submit">
              {editingBlog ? "Cập nhật" : "Thêm bài viết"}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default BlogManagement;
