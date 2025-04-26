import React, { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Form,
  Table,
  Select,
  message,
  Popconfirm,
  Space,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  createManager,
  listmanager,
  removeManager,
  updateManager,
} from "../../APIs/manager";
import { listBranch } from "../../APIs/brand";
import { listUser } from "../../APIs/userApi";

const { Option } = Select;

export const ManagerManagement = () => {
  const [dataManager, setDataManager] = useState([]);
  const [dataBranch, setDataBranch] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [deleting, setDeleting] = useState({});
  const [form] = Form.useForm();
  const [editingManager, setEditingManager] = useState(null);

  const fetchData = async () => {
    setIsTableLoading(true);
    try {
      const [branchRes, managerRes, userRes] = await Promise.all([
        listBranch(),
        listmanager(),
        listUser(),
      ]);
      if (branchRes?.data)
        setDataBranch(branchRes.data.map((item) => ({ ...item, key: item._id })));
      if (managerRes?.data)
        setDataManager(managerRes.data.map((item) => ({ ...item, key: item._id })));
      if (userRes?.data) {
        const managers = userRes.data.filter((user) => user.role === "manager");
        setDataUser(managers.map((item) => ({ ...item, key: item._id })));
      }
    } catch (error) {
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditDrawer = (manager = null) => {
    setEditingManager(manager);
    if (manager) {
      form.setFieldsValue({
        BranchID: manager.BranchID,
        UserID: manager.UserID,
        Position: manager.Position,
      });
    } else {
      form.resetFields();
    }
    setIsDrawerOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editingManager) {
        await updateManager(editingManager._id, values);
        message.success("Cập nhật quản lý thành công!");
      } else {
        await createManager(values);
        message.success("Thêm quản lý thành công!");
      }
      fetchData();
      setIsDrawerOpen(false);
    } catch (error) {
      message.error("Vui lòng nhập đủ thông tin.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting((prev) => ({ ...prev, [id]: true }));
      const response = await removeManager(id);
      if (response.message === "Quản lý đã được xóa thành công") {
        message.success("Xóa quản lý thành công!");
        fetchData();
      } else {
        message.error(response.message);
      }
      setDeleting((prev) => ({ ...prev, [id]: false }));
  };
  const columns = [
    {
      title: "Tên chi nhánh",
      dataIndex: "BranchID",
      key: "BranchID",
      render: (text, record) => {
        const branch = dataBranch.find((b) => b._id === record.BranchID);
        return branch?.BranchName || "Chưa có chi nhánh";
      },
    },
    {
      title: "Tên quản lý",
      dataIndex: "UserID",
      key: "UserID",
      render: (text, record) => {
        const user = dataUser.find((u) => u._id === record.UserID);
        return user ? `${user.firstName}` : "Chưa có người dùng";
      },
    },
    {
      title: "Vị trí",
      dataIndex: "Position",
      key: "Position",
    },
    {
      title: "Số điện thoại",
      dataIndex: "UserID",
      key: "UserID_phone",
      render: (text, record) => {
        const user = dataUser.find((u) => u._id === record.UserID);
        return user ? `${user.phoneNumber}` : "Chưa có số điện thoại";
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="Bạn có chắc muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xoá"
            cancelText="Huỷ"
          >
            <Button
              style={{ color: "red", fontSize: "24px" }}
              icon={<DeleteOutlined />}
              loading={deleting[record._id]}
            />
          </Popconfirm>
          <Button
            style={{ color: "blue", fontSize: "24px" }}
            icon={<EditOutlined />}
            onClick={() => openEditDrawer(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Quản lý quản lý</h2>
        <Button className="bg-blue-400" onClick={() => openEditDrawer()}>
          Thêm quản lý
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataManager}
        loading={isTableLoading}
        rowKey="_id"
        pagination={{ pageSize: 8 }}
      />

      <Drawer
        title={editingManager ? "Chỉnh sửa quản lý" : "Thêm quản lý"}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={400}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="BranchID"
            label="Chi nhánh"
            rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
          >
            <Select placeholder="Chọn chi nhánh">
              {dataBranch.map((branch) => (
                <Option key={branch._id} value={branch._id}>
                  {branch.BranchName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="UserID"
            label="Người dùng"
            rules={[{ required: true, message: "Vui lòng chọn người dùng" }]}
          >
            <Select placeholder="Chọn người dùng">
              {dataUser.map((user) => (
                <Option key={user._id} value={user._id}>
                  {user.firstName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="Position"
            label="Vị trí"
            rules={[{ required: true, message: "Vui lòng nhập vị trí" }]}
          >
            <Select placeholder="Chọn vị trí">
              <Option value="Quản lý chi nhánh">Quản lý chi nhánh</Option>
              <Option value="Quản lý dịch vụ">Quản lý dịch vụ</Option>
            </Select>
          </Form.Item>
          <Button
            className="bg-blue-400"
            type="primary"
            htmlType="submit"
            block
            onClick={handleSubmit}
          >
            Xác nhận
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default ManagerManagement;
