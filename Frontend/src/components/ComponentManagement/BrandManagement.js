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
  Input,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  createBranch,
  listBranch,
  removeBrand,
  updateBranch,
} from "../../APIs/brand";
import {
  createManager,
  listmanager,
  removeManager,
  updateManager,
} from "../../APIs/manager";
import { listUser } from "../../APIs/userApi";

const { Option } = Select;

const BrandManagement = () => {
  const [dataBranch, setDataBranch] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [dataManager, setDataManager] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingBranch, setEditingBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchAllData = async () => {
    setIsTableLoading(true);
    try {
      const [branchRes, userRes, managerRes] = await Promise.all([
        listBranch(),
        listUser(),
        listmanager(),
      ]);

      if (branchRes?.data) {
        const branches = branchRes.data.map((item) => ({
          ...item,
          key: item._id,
        }));
        setDataBranch(branches);
      }

      if (userRes?.data) {
        const managers = userRes.data.filter((user) => user.role === "manager");
        setDataUser(managers.map((item) => ({ ...item, key: item._id })));
      }

      if (managerRes?.data) {
        setDataManager(managerRes.data);
      }
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu");
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openDrawer = (record = null) => {
    setEditingBranch(record);
    if (record) {
      const relatedManager = dataManager.find((m) => m.BranchID === record._id);
      form.setFieldsValue({
        ...record,
        UserID: relatedManager?.UserID,
        Position: relatedManager?.Position,
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
      let branchId;

      if (editingBranch) {
        await updateBranch(editingBranch._id, values);
        branchId = editingBranch._id;
        message.success("Cập nhật chi nhánh thành công!");
      } else {
        const res = await createBranch(values);
        branchId = res?.data?._id;
        message.success("Thêm chi nhánh thành công!");
      }

      if (branchId) {
        const existingManager = dataManager.find((m) => m.BranchID === branchId);
        if (existingManager) {
          await updateManager(existingManager._id, {
            BranchID: branchId,
            UserID: values.UserID,
            Position: values.Position,
          });
        } else {
          await createManager({
            BranchID: branchId,
            UserID: values.UserID,
            Position: values.Position,
          });
        }
      }

      fetchAllData();
      setIsDrawerOpen(false);
    } catch (error) {
      message.error("Vui lòng nhập đủ thông tin hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBranch = async (id) => {
    try {
      await removeBrand(id);
      const manager = dataManager.find((m) => m.BranchID === id);
      if (manager) await removeManager(manager._id);
      message.success("Xóa chi nhánh thành công!");
      fetchAllData();
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa chi nhánh.");
    }
  };

  const filteredBranches = dataBranch.filter((branch) => {
    const manager = dataManager.find((m) => m.BranchID === branch._id);
    const user = dataUser.find((u) => u._id === manager?.UserID);
    const managerName = user ? `${user.firstName} ${user.lastName}` : "";
    return (
      branch.BranchName.toLowerCase().includes(searchText.toLowerCase()) ||
      managerName.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const columns = [
    { title: "Tên chi nhánh", dataIndex: "BranchName", key: "BranchName" },
    { title: "Địa chỉ", dataIndex: "Address", key: "Address" },
    { title: "Số điện thoại", dataIndex: "PhoneNumber", key: "PhoneNumber" },
    {
      title: "Tên quản lý",
      key: "UserID",
      render: (record) => {
        const manager = dataManager.find((m) => m.BranchID === record._id);
        const user = dataUser.find((u) => u._id === manager?.UserID);
        return user ? `${user.firstName} ${user.lastName}` : "";
      },
    },
    {
      title: "Vị trí",
      key: "Position",
      render: (record) => {
        const manager = dataManager.find((m) => m.BranchID === record._id);
        return manager?.Position || "";
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (record) => (
        <Space size="middle">
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa chi nhánh này?"
            onConfirm={() => handleDeleteBranch(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <DeleteOutlined
              style={{ color: "red", fontSize: 20, cursor: "pointer" }}
            />
          </Popconfirm>
          <EditOutlined
            style={{ color: "blue", fontSize: 20, cursor: "pointer" }}
            onClick={() => openDrawer(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <Button
          className="bg-blue-500"
          type="primary"
          onClick={() => openDrawer()}
        >
          Thêm chi nhánh
        </Button>
        <Input.Search
          className="w-1/2"
          placeholder="Tìm theo tên chi nhánh hoặc người quản lý"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Table
        dataSource={filteredBranches}
        columns={columns}
        pagination={{ pageSize: 5 }}
        loading={isTableLoading}
      />

      <Drawer
        title={editingBranch ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh"}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={400}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên chi nhánh"
            name="BranchName"
            rules={[{ required: true, message: "Vui lòng nhập tên chi nhánh" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Địa chỉ"
            name="Address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="PhoneNumber"
            rules={[
              {
                required: true,
                pattern: /^\d{10,11}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input />
          </Form.Item>
        <Form.Item
  name="UserID"
  label="Người quản lý"
  rules={[{ required: true, message: "Vui lòng chọn người quản lý" }]}
>
  <Select placeholder="Chọn người dùng">
    {dataUser
      .filter((user) => {
        const isAssigned = dataManager.some(
          (m) => m.UserID === user._id && m.BranchID !== editingBranch?._id
        );
        return !isAssigned;
      })
      .map((user) => (
        <Option key={user._id} value={user._id}>
          {user.firstName} {user.lastName}
        </Option>
      ))}
  </Select>
</Form.Item>

          <Form.Item
            name="Position"
            label="Vị trí"
            rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
          >
            <Select placeholder="Chọn vị trí">
              <Option value="Quản lý chi nhánh">Quản lý chi nhánh</Option>
              <Option value="Quản lý dịch vụ">Quản lý dịch vụ</Option>
            </Select>
          </Form.Item>
          <Button
            className="mt-4 bg-blue-500"
            type="primary"
            htmlType="submit"
            block
            onClick={handleSubmit}
            loading={loading}
          >
            Xác nhận
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default BrandManagement;
