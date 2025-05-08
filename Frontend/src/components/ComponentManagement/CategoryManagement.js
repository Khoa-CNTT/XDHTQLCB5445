import React, { useState, useEffect } from 'react';
import {
    Button,
    Drawer,
    Table,
    message,
    Input,
    Form,
    Popconfirm,
    Spin,
} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    ReloadOutlined,
    PlusOutlined, // Thêm icon cho nút Thêm mới
} from '@ant-design/icons';
import {
    createCategory,     // Nên là createCategory nếu theo API service mẫu
    getAllCategories,  // Nên là getAllCategories nếu theo API service mẫu
    updateCategory,
    deleteCategory,  // Nên là deleteCategory nếu theo API service mẫu
} from '../../APIs/categoryApis'; // Đảm bảo các hàm này khớp với backend

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isTableLoading, setIsTableLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false); // Đổi tên `loading` thành `formLoading` cho rõ ràng
    const [form] = Form.useForm();

    // Lấy token từ localStorage. Bạn có thể cần xử lý trường hợp token không tồn tại.
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsTableLoading(true);
        try {
            const res = await getAllCategories(token); // Gọi API lấy danh sách
            if (res && (res.success || res.sucsess) && Array.isArray(res.data)) {
                setCategories(res.data.map(cat => ({ ...cat, key: cat._id }))); // Thêm key cho Table
            } else if (res && res.data && Array.isArray(res.data.categories)) { // Xử lý trường hợp data nằm trong data.categories
                setCategories(res.data.categories.map(cat => ({ ...cat, key: cat._id })));
            }
            else {
                // Nếu cấu trúc response không như mong đợi hoặc data không phải là mảng
                console.error('Fetched data is not in expected format:', res);
                setCategories([]); // Đặt thành mảng rỗng để tránh lỗi Table
                message.error(res?.message || 'Không thể tải danh sách danh mục hoặc định dạng dữ liệu không đúng.');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error(`Không thể tải danh sách danh mục: ${error.response?.data?.message || error.message || 'Lỗi không xác định'}`);
            setCategories([]); // Đảm bảo categories là mảng khi có lỗi
        } finally {
            setIsTableLoading(false);
        }
    };

    const openDrawer = (category = null) => {
        setSelectedCategory(category);
        if (category) {
            form.setFieldsValue({
                name: category.name,
                description: category.description, // Thêm description
            });
        } else {
            form.resetFields();
        }
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedCategory(null);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        setFormLoading(true);
        try {
            let response;
            if (selectedCategory) {
                // Cập nhật danh mục: API của bạn nhận id và data (name, description)
                response = await updateCategory(selectedCategory._id, values, token);
                if (response && (response.sucsess || response.success)) {
                    message.success('Cập nhật danh mục thành công!');
                } else {
                    throw new Error(response?.message || 'Cập nhật danh mục thất bại');
                }
            } else {
                // Thêm danh mục mới: API của bạn nhận data (name, description)
                response = await createCategory(values, token);
                if (response && (response.sucsess || response.success)) {
                    message.success('Thêm danh mục thành công!');
                } else {
                    throw new Error(response?.message || 'Thêm danh mục thất bại');
                }
            }
            fetchCategories(); // Tải lại danh sách
            closeDrawer();     // Đóng drawer và reset form
        } catch (error) {
            console.error('Error submitting category:', error);
            message.error(`Có lỗi xảy ra: ${error.message || error.response?.data?.message || 'Lỗi không xác định'}`);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await deleteCategory(id, token);
            if (response && response.success) {
                message.success(response.message || 'Xóa danh mục thành công!');
                fetchCategories(); // Tải lại danh sách
            } else {
                throw new Error(response?.message || 'Xóa danh mục thất bại');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            message.error(`Xóa danh mục thất bại: ${error.message || error.response?.data?.message || 'Lỗi không xác định'}`);
        }
    };

    const columns = [
        {
            title: 'STT',
            key: 'index',
            render: (text, record, index) => index + 1,
            width: '5%',
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: '15%',
            align: 'center',
            render: (_, record) => (
                <>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => openDrawer(record)}
                        style={{ marginRight: 8 }}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa danh mục này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }} // Nút Xóa màu đỏ
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>Quản Lý Danh Mục</h2>
                <div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => openDrawer()}
                        style={{ marginRight: 8 }}
                    >
                        Thêm Danh Mục
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchCategories}
                        loading={isTableLoading && !formLoading} // Chỉ loading khi table đang tải, không phải form
                    >
                        Tải lại
                    </Button>
                </div>
            </div>

            <Spin spinning={isTableLoading}>
                <Table
                    dataSource={categories} // categories đã có key
                    columns={columns}
                    pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['5', '10', '20'] }}
                    bordered // Thêm viền cho bảng
                    scroll={{ x: 'max-content' }} // Cho phép cuộn ngang nếu nội dung quá dài
                />
            </Spin>

            <Drawer
                title={selectedCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                placement="right"
                closable
                onClose={closeDrawer}
                open={isDrawerOpen}
                width={450} // Tăng chiều rộng một chút
                destroyOnClose // Hủy form khi đóng để reset validation
            >
                <Spin spinning={formLoading}>
                    <Form form={form} onFinish={handleSubmit} layout="vertical">
                        <Form.Item
                            name="name"
                            label="Tên danh mục"
                            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                        >
                            <Input placeholder="Nhập tên danh mục" />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Mô tả danh mục"
                            rules={[{ required: true, message: 'Vui lòng nhập mô tả cho danh mục!' }]}
                        >
                            <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết cho danh mục" />
                        </Form.Item>

                        <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
                            <Button onClick={closeDrawer} style={{ marginRight: 8 }}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                            >
                                {selectedCategory ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Drawer>
        </div>
    );
};

export default CategoryManagement;