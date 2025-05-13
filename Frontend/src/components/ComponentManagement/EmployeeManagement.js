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
import { DeleteOutlined, EditOutlined, EyeFilled } from "@ant-design/icons";
import {
  createEmployee,
  listEmployee,
  removeEmployee,
  updateEmployee,
} from "../../APIs/employee";
import { listBranch } from "../../APIs/brand";
import { listUser } from "../../APIs/userApi";
import Schedule from "../Schedule";

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
  const [viewScheduleFor, setViewScheduleFor] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchData = async () => {
    setIsTableLoading(true);
    try {
      const [brandRes, employeeRes, userRes] = await Promise.all([
        listBranch(),
        listEmployee(),
        listUser(),
      ]);
      if (brandRes?.data)
        setDataBrand(brandRes.data.map((item) => ({ ...item, key: item._id })));
      if (employeeRes?.data)
        setDataEmployee(
          employeeRes.data.map((item) => ({ ...item, key: item._id }))
        );
      if (userRes?.data) {
        const employees = userRes.data.filter(
          (user) => user.role === "employee"
        );
        setDataUser(employees.map((item) => ({ ...item, key: item._id })));
      }
    } catch (error) {
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
        Status: employee.Status,
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
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await removeEmployee(id);
      if (response.message === "Nhân viên đã được xóa thành công") {
        message.success("Xóa nhân viên thành công!");
        fetchData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa nhân viên.");
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const columns = [
    {
      title: "Tên chi nhánh",
      dataIndex: "BranchID",
      key: "BranchID",
      render: (text, record) => {
        const branch = dataBrand.find((b) => b._id === record.BranchID);
        return branch?.BranchName || "Chưa có chi nhánh";
      },
      filters: dataBrand
        .filter((branch) => branch._id !== "680b4f376e58bda8dfa176e2")
        .map((branch) => ({ text: branch.BranchName, value: branch._id })),
      onFilter: (value, record) => record.BranchID === value,
    },
    {
      title: "Tên nhân viên",
      dataIndex: "UserID",
      key: "UserID",
      render: (text, record) => {
        const user = dataUser.find((u) => u._id === record.UserID);
        return user
          ? `${user.firstName} ${user.lastName}`
          : "Chưa có nhân viên";
      },
    },
    {
      title: "Vị trí",
      dataIndex: "Position",
      key: "Position",
      filters: [
        { text: "Nhân viên chăm sóc", value: "Nhân viên chăm sóc" },
        { text: "Nhân viên dịch vụ", value: "Nhân viên dịch vụ" },
        { text: "Nhân viên lễ tân", value: "Nhân viên lễ tân" },
      ],
      onFilter: (value, record) => record.Position === value,
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
      title: "Trạng thái",
      dataIndex: "Status",
      key: "Status",
      filters: [
        { text: "Đang làm việc", value: "Đang làm việc" },
        { text: "Tạm nghỉ", value: "Tạm nghỉ" },
      ],
      onFilter: (value, record) => record.Status.indexOf(value) === 0,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="Bạn có chắc muốn xoá?"
            onConfirm={() => handleDeleteEmployee(record._id)}
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
        <h2 className="text-xl font-semibold">Quản lý nhân viên</h2>
        <Button className="bg-blue-400" onClick={() => openEditDrawer()}>
          Thêm nhân viên
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <Select
          placeholder="Chọn nhân viên để xem lịch"
          style={{ width: 250 }}
          onChange={(value) => setSelectedUserId(value)}
          value={selectedUserId}
          allowClear
        >
          {dataUser
            .filter((user) =>
              dataEmployee.some(
                (emp) =>
                  (emp.UserID === user._id || emp.UserID?._id === user._id) &&
                  emp.Status === "Đang làm việc" &&
                  emp.Position === "Nhân viên dịch vụ"
              )
            )
            .map((user) => (
              <Option key={user._id} value={user._id}>
                {user.firstName} {user.lastName}
              </Option>
            ))}
        </Select>

        <Button
          type="default"
          icon={<EyeFilled />}
          disabled={!selectedUserId}
          onClick={() => setViewScheduleFor(selectedUserId)}
        >
          Xem lịch làm việc
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataEmployee}
        loading={isTableLoading}
        rowKey="_id"
        pagination={{ pageSize: 8 }}
      />

      <Drawer
        title={editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}
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
              {dataBrand
                .filter((branch) => branch._id !== "680b4f376e58bda8dfa176e2")
                .map((branch) => (
                  <Option key={branch._id} value={branch._id}>
                    {branch.BranchName}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="UserID"
            label="Nhân viên"
            rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
          >
            <Select placeholder="Chọn nhân viên">
              {dataUser
                .filter((user) => {
                  if (editingEmployee) return true;
                  const alreadyAssigned = dataEmployee.some(
                    (emp) => emp.UserID === user._id
                  );
                  return !alreadyAssigned;
                })
                .map((user) => (
                  <Option key={user._id} value={user._id}>
                    {user.firstName}
                    {" " + user.lastName}
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
              <Option value="Nhân viên chăm sóc">Nhân viên chăm sóc</Option>
              <Option value="Nhân viên dịch vụ">Nhân viên dịch vụ</Option>
              <Option value="Nhân viên lễ tân">Nhân viên lễ tân</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="Status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="Đang làm việc">Đang làm việc</Option>
              <Option value="Tạm nghỉ">Tạm nghỉ</Option>
            </Select>
          </Form.Item>
          <Button
            className="bg-blue-400"
            type="primary"
            htmlType="submit"
            block
            onClick={handleEmployeeSubmit}
            loading={loading}
          >
            Xác nhận
          </Button>
        </Form>
      </Drawer>

      {viewScheduleFor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-xl p-4 relative">
            <Button
              className="absolute top-2 right-2"
              onClick={() => setViewScheduleFor(null)}
            >
              Đóng
            </Button>
            <Schedule employeeViewId={viewScheduleFor} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
