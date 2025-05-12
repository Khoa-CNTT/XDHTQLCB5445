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
    Select,
} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    ReloadOutlined,
    PlusOutlined, // Thêm icon cho nút Thêm mới
} from '@ant-design/icons';
import {
    createCategory,   
    getAllCategories,  
    updateCategory,
    deleteCategory, 
} from '../../APIs/categoryApis';
import { Option } from 'lucide-react';
import { filterProps } from 'framer-motion';

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
        const res = await getAllCategories(token);
        const data = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.categories)
                ? res.data.categories
                : [];

        if (data.length > 0) {
            setCategories(data.map(cat => ({ ...cat, key: cat._id })));
        } else {
            setCategories([]);
            message.warning('Không có danh mục nào hoặc định dạng dữ liệu không đúng.');
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        message.error(`Không thể tải danh sách danh mục: ${error?.response?.data?.message || error.message}`);
        setCategories([]);
    } finally {
        setIsTableLoading(false);
    }
};


    const openDrawer = (category = null) => {
        setSelectedCategory(category);
        if (category) {
            form.setFieldsValue({
                name: category.name,
                description: category.description, 
                style: category.style,
                applicableFor: category.applicableFor,
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
        if (selectedCategory) {
            await updateCategory(selectedCategory._id, values);
            message.success('Cập nhật danh mục thành công!');
           
        } else {
          await createCategory(values);
                message.success('Thêm danh mục thành công!');
        }

        fetchCategories();
        closeDrawer();
    } catch (error) {
        console.error('Error submitting category:', error);
        message.error(`Có lỗi xảy ra: ${error?.response?.data?.message || error.message || 'Lỗi không xác định'}`);
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
            title: 'Áp dụng cho',
            dataIndex: 'applicableFor', 
            key: 'applicableFor',
            ellipsis: true,
            filters: [
                { text: 'Sản phẩm', value: 'Sản phẩm' },
                { text: 'Dịch vụ', value: 'Dịch vụ' },
            ],
            onFilter: (value, record) => record.applicableFor.includes(value),
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
                width={450} 
                destroyOnClose
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
                            name="applicableFor"
                            label="Áp dụng cho"
                            rules={[{ required: true, message: 'Vui lòng nhập đối tượng áp dụng!' }]}
                        >
                        <Select>
                            <Option value="Sản phẩm">Sản phẩm</Option>
                            <Option value="Dịch vụ">Dịch vụ</Option>

                        </Select>
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