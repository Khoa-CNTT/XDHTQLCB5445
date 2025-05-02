import React, { useEffect, useState } from 'react';
import { listUser, updateUser, updateUserRole } from '../../APIs/userApi';
import { Button, Drawer, Input, Table, Select, Form, Popconfirm, message } from 'antd';
import {  EditOutlined } from '@ant-design/icons';
import { FaLock, FaUnlock } from 'react-icons/fa6';
const { Option } = Select;

const AccountManagement = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAccount();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = data.filter((item) => {
        const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
        return (
          fullName.includes(lowercasedQuery) ||
          item.email?.toLowerCase().includes(lowercasedQuery)
        );
      });
      
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchQuery, data]);
  const fetchAccount = async () => {
    try {
      const res = await listUser();
      if (Array.isArray(res.data)) {
        setData(res.data.map((item) => ({ ...item, key: item._id })));
        setFilteredData(res.data.map((item) => ({ ...item, key: item._id })));
      } else {
        setData([]);
        setFilteredData([]);
      }
    } catch (error) {
      setData([]);
      setFilteredData([]);
    }
  };

  const openEditDrawer = (user) => {
    setSelectedUser(user);
    setIsEditOpen(true);
    form.setFieldsValue(user);
  };
  const handleUpdateAccount = async () => {
      const updatedRole = form.getFieldValue('role'); 
      const updatedUser = { ...selectedUser, role: updatedRole };
      await updateUserRole(updatedUser._id, { role: updatedRole });
      message.success('Cập nhật thành công!');
      setIsEditOpen(false);
      fetchAccount(); 
  };
  
  const handleToggleBlockAccount = async (user) => {
    try {
      const newStatus = !user.isEmailVerified;
      await updateUser(user._id, { isEmailVerified: newStatus });
      message.success(`Đã ${newStatus ? 'mở khóa' : 'chặn'} email cho tài khoản!`);
      fetchAccount();
    } catch {
      message.error('Có lỗi khi cập nhật trạng thái xác thực email.');
    }
  };
  const columns = [
    {
      title: 'Tên tài khoản',
      key: 'fullName',
      render: (_, record) => `${record.firstName || ''} ${record.lastName || ''}`.trim(),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Vai trò', dataIndex: 'role', key: 'role' },
    {
      title: 'Email Đã xác thực',
      dataIndex: 'isEmailVerified',
      key: 'isEmailVerified',
      render: v => v ? 'Đang hoạt động' : 'Đã bị chặn',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <span>
          <Popconfirm
            title="Bạn có chắc chặn người dùng này không?"
            onConfirm={() => handleToggleBlockAccount(record)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Button
              style={{ color: record.isEmailVerified ? 'green' : 'red', marginLeft:'20px', fontSize: 20 }}

            >
              {record.isEmailVerified ? <FaUnlock  /> : <FaLock />}
            </Button>
          </Popconfirm>
          <EditOutlined
            style={{ color: 'blue', fontSize: 20, marginLeft: 16, cursor: 'pointer' }}
            onClick={() => openEditDrawer(record)}
          />
        </span>
      ),
    },
  ];
  
  return (
    <div className="mt-3">
      <h1>Quản lý tài khoản</h1>
      <Input
        style={{ width: '300px', marginBottom: '16px', marginTop: '16px' , outline: 'none'}}
        placeholder="Tìm kiếm theo tên tài khoản hoặc email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Table
        className="mt-3"
        dataSource={filteredData}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />

      <Drawer
        title="Chỉnh sửa tài khoản"
        placement="right"
        closable

        onClose={() => setIsEditOpen(false)}
        open={isEditOpen}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="firstName"
            label="Tên"
            // rules={[{ required: true, message: 'Vui lòng nhập tên người dùng' }]}
          >
            <Input  disabled />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Họ"
            >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select>
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
              <Option value="employee">Employee</Option>
            </Select>
          </Form.Item>
          <Button
            className="mt-4 bg-blue-700"
            type="primary"
            block
            onClick={handleUpdateAccount}
           >
            Xác nhận cập nhật
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default AccountManagement;
