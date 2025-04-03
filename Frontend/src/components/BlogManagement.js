import React, { useEffect, useState } from "react";
import { getAllBlogs, createBlog, updateBlog, deleteBlog } from "../APIs/blogApi";
import { Table, Button, Input, Upload, message, Drawer, Switch } from "antd";
import { UploadOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getBase64 } from "../utils/ultils";

const BlogManagement = () => {
    const [blogs, setBlogs] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState("");
    const [isPublished, setIsPublished] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const userId = "123456";

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await getAllBlogs();  // Ensure this is the right API method
            console.log("Data from API: ", response);  // Log full response to check structure
            if (response.success && Array.isArray(response.data)) {
                setBlogs(response.data.map((item) => ({ ...item, key: item._id })));  // Update state
            } else {
                message.error("Không lấy được dữ liệu blog!");
            }
        } catch (error) {
            console.error("Error fetching blogs: ", error);
            message.error("Lỗi tải danh sách bài viết!");
        }
    };

    const handleSubmit = async () => {
        if (title.trim() === "" || content.trim() === "") {
            message.error("Vui lòng nhập tiêu đề và nội dung!");
            return;
        }
        const blogData = { userId, title, content, image, isPublished };
        try {
            if (editingId) {
                await updateBlog(editingId, blogData);
                message.success("Cập nhật bài viết thành công!");
                setEditingId(null);
            } else {
                await createBlog(blogData);
                message.success("Thêm bài viết thành công!");
            }

            setTitle("");
            setContent("");
            setImage("");
            setIsPublished(false);
            setFileList([]);
            setIsDrawerOpen(false);
            fetchBlogs();
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi thêm/cập nhật bài viết!");
        }
    };

    const handleEdit = (blog) => {
        setTitle(blog.title);
        setContent(blog.content);
        setImage(blog.image);
        setIsPublished(blog.isPublished);
        setEditingId(blog._id);
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
            try {
                await deleteBlog(id);
                message.success("Xóa bài viết thành công!");
                fetchBlogs();
            } catch (error) {
                console.error(error);
                message.error("Lỗi khi xóa bài viết!");
            }
        }
    };

    const handleImageChange = async ({ fileList }) => {
        const file = fileList[0];
        if (file && !file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setImage(file.preview);
        setFileList(fileList);
    };

    const columns = [
        { title: "Tiêu đề", dataIndex: "title", key: "title" },
        { title: "Nội dung", dataIndex: "content", key: "content" },
        { title: "Người đăng", dataIndex: "userId", key: "userId" },
        {
            title: "Ảnh",
            dataIndex: "image",
            key: "image",
            render: (img) => img && <img width={50} height={50} src={img} alt="Ảnh bài viết" />,
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
                    <EditOutlined onClick={() => handleEdit(record)} style={{ marginRight: 10, cursor: "pointer" }} />
                    <DeleteOutlined onClick={() => handleDelete(record._id)} style={{ color: "red", cursor: "pointer" }} />
                </span>
            ),
        },
    ];

    return (
        <div>
            <h1>Quản lý Blog</h1>
            <Button type="primary" onClick={() => setIsDrawerOpen(true)}>Thêm bài viết</Button>
            <Table className="mt-4" dataSource={blogs} columns={columns} pagination={{ pageSize: 5 }} />
            <Drawer
                title={editingId ? "Cập nhật bài viết" : "Thêm bài viết"}
                placement="right"
                closable
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
            >
                <Input placeholder="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Input.TextArea placeholder="Nội dung" value={content} onChange={(e) => setContent(e.target.value)} className="mt-3" />
                <Upload fileList={fileList} beforeUpload={() => false} onChange={handleImageChange} showUploadList>
                    <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
                </Upload>
                {image && <img src={image} alt="Ảnh xem trước" style={{ width: 100, height: 100, marginTop: 10 }} />}
                <div className="mt-3">
                    <span>Hiển thị công khai:</span>
                    <Switch checked={isPublished} onChange={(checked) => setIsPublished(checked)} className="ml-2" />
                </div>
                <Button className="mt-4 bg-blue-700" onClick={handleSubmit}>
                    {editingId ? "Cập nhật" : "Thêm bài viết"}
                </Button>
            </Drawer>
        </div>
    );
};

export default BlogManagement;
