import React, { useEffect, useState } from 'react';
import { listUser, removeUser, updateUserRole } from '../../APIs/userApi';
import { Button, Drawer, Input, Table, message, Select, Form } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { errorToast, successToast, toastContainer } from '../../utils/toast';

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
      const filtered = data.filter((item) =>
        (item.firstName?.toLowerCase().includes(lowercasedQuery) ||
         item.email?.toLowerCase().includes(lowercasedQuery))
      );
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
      console.error('Lỗi khi tải danh sách user:', error);
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
    try {
      const values = await form.validateFields();
      await updateUserRole(selectedUser._id, values);
      successToast('Cập nhật role thành công!');
      setIsEditOpen(false);
      fetchAccount();
    } catch (error) {
      console.error('Lỗi khi cập nhật role:', error);
      errorToast('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleDeleteAccount = async (userId) => {
    try {
      const res = await removeUser(userId);
      if (res.success) {
        message.success('Xóa tài khoản thành công!');
        fetchAccount();
      }
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra khi xóa tài khoản.');
    }
  };

  const columns = [
    { title: 'Tên tài khoản', dataIndex: 'firstName', key: 'firstName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Vai trò', dataIndex: 'role', key: 'role' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <div>
          <DeleteOutlined
            style={{ color: 'red', fontSize: '20px', cursor: 'pointer' }}
            onClick={() => handleDeleteAccount(record._id)}
          />
          <EditOutlined
            style={{ color: 'blue', fontSize: '20px', marginLeft: '10px', cursor: 'pointer' }}
            onClick={() => openEditDrawer(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="mt-3">
      {toastContainer()}
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
            rules={[{ required: true, message: 'Vui lòng nhập tên người dùng' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input />
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
