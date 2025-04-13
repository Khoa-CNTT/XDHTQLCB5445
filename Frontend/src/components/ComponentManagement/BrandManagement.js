import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import {
  createBranch,
  listBranch,
  removeBrand,
  updateBranch,
} from "../../APIs/brand";
import { Button, Drawer, Modal, Table, message, Form, Input, Popconfirm } from "antd";

export const BrandManagement = () => {
  const [dataBrand, setDataBrand] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchBrand = async () => {
    try {
      const res = await listBranch();
      if (res && res.data) {
        setDataBrand(res.data.map((item) => ({ ...item, key: item._id })));
      } else {
        setDataBrand([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chi nhánh:", error);
      setDataBrand([]);
    }
  };

  useEffect(() => {
    fetchBrand();
  }, []);

  const openEditDrawer = (brand = null) => {
    if (brand) {
      setIsEditMode(true);
      setEditId(brand._id);
      form.setFieldsValue(brand);
    } else {
      setIsEditMode(false);
      setEditId(null);
      form.resetFields();
    }
    setIsDrawerOpen(true);
  };

  const handleUpdateBrand = async () => {
    try {
      const values = await form.validateFields();
      if (isEditMode) {
        await updateBranch(editId, values);
        message.success("Cập nhật chi nhánh thành công!");
      } else {
        await createBranch(values);
        message.success("Thêm chi nhánh thành công!");
      }
      fetchBrand();
      setIsDrawerOpen(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật chi nhánh:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const handleDeleteBrand = async (id) => {
    try {
      await removeBrand(id);
      message.success("Xóa chi nhánh thành công!");
      fetchBrand();
    } catch (error) {
      console.error("Lỗi khi xóa chi nhánh:", error);
      message.error("Có lỗi xảy ra khi xóa chi nhánh.");
    }
  };

  const columns = [
    { title: "Tên chi nhánh", dataIndex: "BranchName", key: "BranchName" },
    { title: "Địa chỉ", dataIndex: "Address", key: "Address" },
    { title: "Số điện thoại", dataIndex: "PhoneNumber", key: "PhoneNumber" },
    {
      title: "Hành động",
      key: "action",
      render: (record) => (
        <div>
            <Popconfirm
                        title="Bạn có chắc chắn muốn xóa thương hiệu này?"
                        onConfirm={() => handleDeleteBrand(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{
                        style: { backgroundColor: 'blue', color: 'white', borderRadius: '5px' }
                    }}
                    >
                        <DeleteOutlined
                            style={{ color: "red", fontSize: "20px", cursor: "pointer" }}
                        />
                    </Popconfirm>
          <EditOutlined
            style={{
              color: "blue",
              fontSize: "20px",
              marginLeft: "10px",
              cursor: "pointer",
            }}
            onClick={() => openEditDrawer(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="mt-3">
      <h2>Quản lý Brand</h2>
      <Button className="mt-5 bg-blue-500" onClick={() => openEditDrawer()}>
        Thêm Brand
      </Button>

      <Drawer
        title={isEditMode ? "Chỉnh sửa Brand" : "Thêm Brand"}
        placement="right"
        closable
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Tên Brand"
            name="BranchName"
            rules={[{ required: true, message: "Vui lòng nhập tên Brand" }]}
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
              { required: true, message: "Vui lòng nhập số điện thoại" },
              { pattern: /^\d{10,11}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>
          <Button
            className="mt-4 bg-blue-500"
            type="primary"
            onClick={() => setIsModalOpen(true)}
            block
          >
            Xác nhận cập nhật
          </Button>
        </Form>
      </Drawer>

      <Modal
        title="Xác nhận cập nhật"
        open={isModalOpen}
        onOk={handleUpdateBrand}
        onCancel={() => setIsModalOpen(false)}
      >
        <p>Bạn có chắc chắn muốn cập nhật Brand với thông tin mới không?</p>
      </Modal>

      <Table
        style={{ marginTop: 20 }}
        dataSource={dataBrand}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};
