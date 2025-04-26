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
import { listmanager } from "../../APIs/manager";

const { Option } = Select;

export const EmployeeBrand = () => {
  const [dataEmployee, setDataEmployee] = useState([]);
  const [dataBrand, setDataBrand] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [deleting, setDeleting] = useState({});
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [viewScheduleFor, setViewScheduleFor] = useState(null);
  const [managerBranchId, setManagerBranchId] = useState(null);
  const [managerBranchInfo, setManagerBranchInfo] = useState(null); // 👈

  useEffect(() => {
    const fetchManagerBranch = async () => {
      try {
        const userId = localStorage.getItem("userId");
  
        const [managerRes, branchRes] = await Promise.all([
          listmanager(),
          listBranch(),
        ]);
  
        const managerList = managerRes?.data || [];
        const branchList = branchRes?.data || [];
  
        const currentManager = managerList.find((m) => {
          return (
            m.UserID === userId ||
            (typeof m.UserID === "object" && m.UserID?._id === userId)
          );
        });
  
        if (currentManager) {
          setManagerBranchId(currentManager.BranchID);
  
          const branchInfo = branchList.find(
            (b) => b._id === currentManager.BranchID
          );
          setManagerBranchInfo(branchInfo);
        } else {
          message.error("Không tìm thấy thông tin quản lý.");
        }
      } catch (err) {
        message.error("Không thể lấy thông tin chi nhánh.");
        console.error(err);
      }
    };
  
    fetchManagerBranch();
  }, []);
  

  const fetchData = async () => {
    if (!managerBranchId) return;

    setIsTableLoading(true);
    try {
      const [brandRes, employeeRes, userRes] = await Promise.all([
        listBranch(),
        listEmployee(),
        listUser(),
      ]);

      if (brandRes?.data)
        setDataBrand(brandRes.data.map((item) => ({ ...item, key: item._id })));

      if (employeeRes?.data) {
        const employeesInBranch = employeeRes.data.filter(
          (emp) => emp.BranchID === managerBranchId
        );
        setDataEmployee(
          employeesInBranch.map((item) => ({ ...item, key: item._id }))
        );
      }

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
    if (managerBranchId) {
      fetchData();
    }
  }, [managerBranchId]);

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
    },
    {
      title: "Tên nhân viên",
      dataIndex: "UserID",
      key: "UserID",
      render: (text, record) => {
        const user = dataUser.find((u) => u._id === record.UserID);
        return user ? `${user.firstName}` : "Chưa có nhân viên";
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
      title: "Trạng thái",
      dataIndex: "Status",
      key: "Status",
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

  const filteredUsers = selectedBranch
    ? dataEmployee
        .filter((emp) => emp.BranchID === selectedBranch)
        .map((emp) => emp.UserID)
    : [];


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Quản lý nhân viên
          {managerBranchInfo ? ` - ${managerBranchInfo.BranchName}` : ""}
        </h2>
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
            emp.UserID === user._id || emp.UserID?._id === user._id
        )
      )
      .map((user) => (
        <Option key={user._id} value={user._id}>
          {user.firstName}
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
            initialValue={managerBranchId}
            rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
          >
            <Select placeholder="Chọn chi nhánh" disabled>
              {managerBranchInfo && (
                <Option
                  key={managerBranchInfo._id}
                  value={managerBranchInfo._id}
                >
                  {managerBranchInfo.BranchName}
                </Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            name="UserID"
            label="Nhân viên"
            rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
          >
            <Select placeholder="Chọn nhân viên">
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

export default EmployeeBrand;
