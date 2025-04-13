import { DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { Button, Drawer, Form, Table, Select, Spin, message,Popconfirm } from 'antd';
import { createEmployee, listEmployee, removeEmployee, updateEmployee } from '../../APIs/employee';
import { listBranch } from '../../APIs/brand';
import { listUser } from '../../APIs/userApi';

const { Option } = Select;

export const EmployeeManagement = () => {
    const [dataEmployee, setDataEmployee] = useState([]);
    const [dataBrand, setDataBrand] = useState([]);
    const [dataUser, setDataUser] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [deleting, setDeleting] = useState({});
    const [form] = Form.useForm();
    const [editingEmployee, setEditingEmployee] = useState(null);

    const fetchData = async () => {
        setIsTableLoading(true);
        try {
            const [brandRes, employeeRes, userRes] = await Promise.all([
                listBranch(),
                listEmployee(),
                listUser()
            ]);

            if (brandRes?.data) setDataBrand(brandRes.data.map(item => ({ ...item, key: item._id })));
            if (employeeRes?.data) setDataEmployee(employeeRes.data.map(item => ({ ...item, key: item._id })));
            if (userRes?.data) {
                const employees = userRes.data.filter(user => user.role === 'employee');
                setDataUser(employees.map(item => ({ ...item, key: item._id })));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            message.error("Lỗi khi tải dữ liệu!");
        } finally {
            setIsTableLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openEditDrawer = (employee = null) => {
        setEditingEmployee(employee);
        if (employee) {
            form.setFieldsValue({
                BranchID: employee.BranchID,
                UserID: employee.UserID,
                Position: employee.Position,
                Status: employee.Status
            });
        } else {
            form.resetFields();
        }
        setIsDrawerOpen(true);
    };

    const handleEmployeeSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (editingEmployee) {
                await updateEmployee(editingEmployee._id, values);
                message.success("Cập nhật nhân viên thành công!");
            } else {
                await createEmployee(values);
                message.success("Thêm nhân viên thành công!");
            }

            fetchData();
            setIsDrawerOpen(false);
        } catch (error) {
            console.error("Error saving employee:", error);
            message.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEmployee = async (id) => {
        setDeleting(prev => ({ ...prev, [id]: true })); 
        try {
            const response = await removeEmployee(id);
    
            if (response.message === "Nhân viên đã được xóa thành công") {
                message.success("Xóa nhân viên thành công!");
                fetchData(); // Reload the table data
            } else {
                message.error(response.message); // Show error if the employee cannot be deleted
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
            message.error("Có lỗi xảy ra khi xóa nhân viên.");
        } finally {
            setDeleting(prev => ({ ...prev, [id]: false })); // Reset loading state
        }
    };

    

    const columns = [
        {
            title: 'Tên chi nhánh',
            dataIndex: 'BranchID',
            key: 'BranchID',
            render: (text, record) => {
                const branch = dataBrand.find(b => b._id === record.BranchID);
                return branch?.BranchName || 'Chưa có chi nhánh';
            },
        },
        {
            title: 'Tên nhân viên',
            dataIndex: 'UserID',
            key: 'UserID',
            render: (text, record) => {
                const user = dataUser.find(u => u._id === record.UserID);
                return user ? `${user.firstName}` : 'Chưa có nhân viên'; 
            },
        },
        {
            title: 'Vị trí',
            dataIndex: 'Position',
            key: 'Position',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'Status',
            key: 'Status',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (record) => (
                <div>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa nhân viên này?"
                        onConfirm={() => handleDeleteEmployee(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{
                        style: { backgroundColor: 'blue', color: 'white', borderRadius: '5px' }
                    }}
                    >
                        <DeleteOutlined
                            style={{ color: "red", fontSize: "20px", cursor: "pointer" }}
                            disabled={deleting[record._id]}
                        />
                    </Popconfirm>
                    <EditOutlined
                        style={{ color: "blue", fontSize: "20px", marginLeft: "10px", cursor: "pointer" }}
                        onClick={() => openEditDrawer(record)}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="mt-3">
            <h2>Quản lý nhân viên</h2>
            <div className="flex justify-between items-center mb-4">
                <Button 
                    className="bg-blue-500 mt-5" 
                    onClick={() => openEditDrawer()}
                >
                    Thêm nhân viên
                </Button>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchData}
                    loading={isTableLoading}
                >
                    Tải lại
                </Button>
            </div>

            <Spin spinning={isTableLoading}>
                <Table 
                    dataSource={dataEmployee} 
                    columns={columns} 
                    pagination={{ pageSize: 5 }} 
                    rowKey="_id"
                />
            </Spin>

            <Drawer
                title={editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}
                placement="right"
                width={500}
                closable
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="BranchID"
                        label="Chi nhánh"
                        rules={[{ required: true, message: 'Vui lòng chọn chi nhánh!' }]}>
                        <Select placeholder="Chọn chi nhánh">
                            {dataBrand.map((item) => (
                                <Option key={item._id} value={item._id}>
                                    {item.BranchName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="UserID"
                        label="Nhân viên"
                        rules={[{ required: true, message: 'Vui lòng chọn nhân viên!' }]}>
                        <Select placeholder="Chọn nhân viên">
                            {dataUser.map((item) => (
                                <Option key={item._id} value={item._id}>
                                    {item.firstName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="Position"
                        label="Vị trí"
                        rules={[{ required: true, message: 'Vui lòng chọn vị trí!' }]}>
                        <Select placeholder="Chọn vị trí">
                            <Option value="Nhân viên lễ tân">Nhân viên lễ tân</Option>
                            <Option value="Nhân viên chăm sóc">Nhân viên chăm sóc</Option>
                            <Option value="Nhân viên Spa">Nhân viên Spa</Option>
                            <Option value="Nhân viên tư vấn">Nhân viên tư vấn</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="Status"
                        label="Trạng thái"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}>
                        <Select placeholder="Chọn trạng thái">
                            <Option value="Đang làm việc">Đang làm việc</Option>
                            <Option value="Nghỉ việc">Nghỉ việc</Option>
                            <Option value="Thử việc">Thử việc</Option>
                        </Select>
                    </Form.Item>

                    <Button 
                        className='bg-blue-500'
                        block
                        onClick={handleEmployeeSubmit}
                        loading={loading}
                    >
                        Xác nhận
                    </Button>
                </Form>
            </Drawer>
        </div>
    );
};
