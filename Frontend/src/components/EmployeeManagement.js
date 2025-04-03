import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { Button, Drawer, Table, Select, message } from 'antd';
import { createEmployee, listEmployee, removeEmployee, updateEmployee } from '../APIs/employee';
import { listBranch } from '../APIs/brand';
import { listUser } from '../APIs/userApi';

const { Option } = Select;

export const EmployeeManagement = () => {
    const [dataEmployee, setDataUserEmployee] = useState([]);
    const [dataBrand, setDataUserBrand] = useState([]);
    const [dataUser, setDataUser] = useState([]);
    const [selectEmployee, setSelectEmployee] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const fetchAccount = async () => {
        try {
            const res = await listUser();
            if (Array.isArray(res.data)) {
                const employees = res.data.filter(user => user.role === 'employee');
                setDataUser(employees.map(item => ({ ...item, key: item._id })));
            } else {
                setDataUser([]);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng:", error);
            setDataUser([]);
        }
    };
    const fetchBrand = async () => {
        try {
            const res = await listBranch();
            if (res && res.data) {
                setDataUserBrand(res.data.map(item => ({ ...item, key: item._id })));
            } else {
                setDataUserBrand([]);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách chi nhánh:", error);
            setDataUserBrand([]);
        }
    };

    const fetchEmployee = async () => {
        try {
            const res = await listEmployee();
            if (res && res.data) {
                setDataUserEmployee(res.data.map(item => ({ ...item, key: item._id })));
            } else {
                setDataUserEmployee([]);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách nhân viên:", error);
            setDataUserEmployee([]);
        }
    };
    useEffect(() => {
        fetchBrand();
        fetchEmployee();
        fetchAccount();
    }, []);
    const handleFieldChange = (field, value) => {
        setSelectEmployee((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const openEditDrawer = (employee = null) => {
        setSelectEmployee(employee ? { ...employee } : { BranchID: "", UserID: "", Position: "", Status: "" });
        setIsDrawerOpen(true);
    };
    
    const handleUpdateEmployee = async () => {
        try {
            if (!selectEmployee.BranchID || !selectEmployee.UserID || !selectEmployee.Position || !selectEmployee.Status) {
                console.log("Vui lòng chọn đầy đủ thông tin.");
                return;
            }
            if(selectEmployee._id) {
                await updateEmployee(selectEmployee._id, selectEmployee);
                message.success("Cập nhật nhân viên thành công!");
            } else {
                await createEmployee(selectEmployee);
                message.success("Thêm nhân viên thành công!");
            }
            fetchEmployee();
            setIsDrawerOpen(false);
        } catch (error) {
            message.error("Có lỗi xảy ra, vui lòng thử lại.");
        }
    };
    

    const handleDeleteEmployee = async (id) => {
        try {
            await removeEmployee(id);
            message.success("Xóa nhân viên thành công!");
            fetchEmployee();
        } catch (error) {
            console.error("Lỗi khi xóa nhân viên:", error);
            message.error("Có lỗi xảy ra khi xóa nhân viên.");
        }
    };

    // Table columns
    const columns = [
        {
            title: 'Tên chi nhánh',
            dataIndex: 'BranchID',
            key: 'BranchID',
            render: (text, record) => {
                const branch = dataBrand.find(branch => branch._id === record.BranchID);
                return branch ? branch.BranchName : 'Chưa có chi nhánh';
            },
        },
        {
            title: 'Tên nhân viên',
            dataIndex: 'UserID',
            key: 'UserID',
            render: (text, record) => {
                const user = dataUser.find(user => user._id === record.UserID);
                return user ? `${user.firstName}` : 'Chưa có nhân viên'; 
            },
        },
        {
            title: 'Vị trí',
            dataIndex: 'Position',
            key: 'Position',
        },
        {
            title: 'Hoạt động',
            dataIndex: 'Status',
            key: 'Status',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (record) => (
                <div>
                    <DeleteOutlined
                        style={{ color: "red", fontSize: "20px", cursor: "pointer" }}
                        onClick={() => handleDeleteEmployee(record._id)}
                    />
                    <EditOutlined
                        style={{ color: "blue", fontSize: "20px", marginLeft: "10px", cursor: "pointer" }}
                        onClick={() => openEditDrawer(record)}
                    />
                </div>
            ),
        },
    ];
    

    return (
        <div>
            <h2>Quản lý nhân viên</h2>
            <Button className='bg-blue-600' onClick={() => openEditDrawer()}>Thêm Nhân Viên</Button>

            <Drawer
    title={selectEmployee && selectEmployee._id ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}
    placement="right"
    closable
    onClose={() => setIsDrawerOpen(false)}
    open={isDrawerOpen}
>

                <Select
                    placeholder="Chọn chi nhánh"
                    style={{ width: '100%', marginBottom: '10px' }}
                    value={selectEmployee?.BranchID || ""}
                    onChange={(value) => handleFieldChange('BranchID', value)}
                >
                    {dataBrand.map((item) => (
                        <Option key={item._id} value={item._id}>
                            {item.BranchName}
                        </Option>
                    ))}
                </Select>

                <Select
                    placeholder="Chọn nhân viên"
                    style={{ width: '100%', marginBottom: '10px' }}
                    value={selectEmployee?.UserID || ""}
                    onChange={(value) => handleFieldChange('UserID', value)}
                >
                    {dataUser.map((item) => (
                        <Option key={item._id} value={item._id}>
                            {item.firstName}
                        </Option>
                    ))}
                </Select>

                <Select
                    value={selectEmployee?.Position}
                    onChange={(value) => handleFieldChange('Position', value)}
                    className="mt-3"
                    style={{ width: '100%' }}
                >
                    <Option value="Nhân viên lễ tân">Nhân viên lễ tân</Option>
                    <Option value="Nhân viên chăm sóc">Nhân viên chăm sóc</Option>
                    <Option value="Nhân viên Spa">Nhân viên Spa</Option>
                    <Option value="Nhân viên tư vấn">Nhân viên tư vấn</Option>
                </Select>

                <Select
                    value={selectEmployee?.Status}
                    onChange={(value) => handleFieldChange('Status', value)}
                    className="mt-3"
                    style={{ width: '100%' }}
                >
                    <Option value="Đang làm việc">Đang làm việc</Option>
                    <Option value="Nghỉ việc">Nghỉ việc</Option>
                    <Option value="Thử việc">Thử việc</Option>
                </Select>

                <Button className="mt-4 bg-blue-400" onClick={handleUpdateEmployee}>
                    Xác nhận cập nhật
                </Button>
            </Drawer>

            <Table style={{ marginTop: 20 }} dataSource={dataEmployee} columns={columns} pagination={{ pageSize: 5 }} />
        </div>
    );
};
