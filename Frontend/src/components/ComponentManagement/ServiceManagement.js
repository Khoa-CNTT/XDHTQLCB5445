import React, { useState, useEffect } from "react";
import {
  Button,
  Drawer,
  Table,
  Select,
  message,
  Input,
  Upload,
  Spin,
  Form,
  Popconfirm,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from "../../APIs/ServiceAPI";
import { getAllCategories } from "../../APIs/categoryApis";
import { getBase64 } from "../../utils/ultils";

const { Option } = Select;

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [selectService, setSelectService] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchServices();
    fetchCategories(); // fetch từ API category và lọc
  }, []);

  const fetchServices = async () => {
    setIsTableLoading(true);
    try {
      const response = await getAllServices();
      if (response.success) {
        const fetched = response.data.map(item => ({ ...item, key: item._id }));
        setServices(fetched);
      } else {
        setServices([]);
      }
    } catch (err) {
      setServices([]);
    } finally {
      setIsTableLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      if (res.success && Array.isArray(res.data)) {
        const svcCats = res.data
          .filter(cat => cat.applicableFor === "Dịch vụ")
          .map(cat => ({ _id: cat._id, name: cat.name }));
        setCategories(svcCats);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    }
  };

  const openEditDrawer = svc => {
    if (svc) {
      setSelectService(svc);
      setImage(svc.image || null);
      setFileList(svc.image ? [{ url: svc.image }] : []);
      form.setFieldsValue({
        name: svc.name,
        description: svc.description,
        price: svc.price,
        duration: svc.duration,
        category: svc.category,
      });
    } else {
      setSelectService(null);
      setImage(null);
      setFileList([]);
      form.resetFields();
    }
    setIsDrawerOpen(true);
  };

  const handleDeleteService = async id => {
    try {
      await deleteService(id);
      message.success("Xóa dịch vụ thành công!");
      fetchServices();
    } catch {
      message.error("Xóa dịch vụ thất bại!");
    }
  };

  const handleImageChange = async ({ fileList }) => {
    const file = fileList[0];
    if (file && file.originFileObj) {
      const base64 = await getBase64(file.originFileObj);
      setImage(base64);
    }
    setFileList(fileList);
  };

  const handleFormFinish = async values => {
    try {
       if(!image) {
              message.error('Vui lòng tải lên hình ảnh dịch vụ!');
              return;
            }
      if (values.price < 0 || values.duration < 0) {
        message.error("Giá và thời gian không được âm!");
        return;
      }
      const payload = {
        ...values,
        image: image || selectService?.image || "",
      };

      if (selectService?._id) {
        await updateService(selectService._id, payload);
        message.success("Cập nhật dịch vụ thành công!");
      } else {
        await createService(payload);
        message.success("Thêm dịch vụ thành công!");
      }

      fetchServices();
      setIsDrawerOpen(false);
      form.resetFields();
    } catch {
      message.error("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      filters: services.map(s => ({ text: s.name, value: s.name })),
      onFilter: (v, r) => r.name?.toLowerCase().includes(v.toLowerCase()),
    },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: p =>
        p.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
      filters: [
        { text: "Dưới 300.000", value: "Dưới 300.000" },
        { text: "300.000 - 500.000", value: "300.000 - 500.000" },
        { text: "500.000 - 1.000.000", value: "500.000 - 1.000.000" },
        { text: "Trên 1.000.000", value: "Trên 1.000.000" },
      ],
      onFilter: (v, r) => {
        const price = r.price;
        if (v === "Dưới 300.000") {
          return price < 300.000;
        } else if (v === "300.000 - 500.000") {
          return price >= 300.000 && price <= 500.000;
        } else if (v === "500.000 - 1.000.000") {
          return price > 500.000 && price <= 1000.000;
        } else if (v === "Trên 1.000.000") {
          return price > 1000.000;
        }
        return false;
      },
    },
    {
      title: "Thời gian (phút)",
      dataIndex: "duration",
      key: "duration",
      filters: [
        { text: "0 phút - 60 phút", value: '0 phút - 60 phút' },
        { text: "60 phút - 120 phút", value: '60 phút - 90 phút' },
        { text: "90 phút - 120 phút", value: '90 phút - 120 phút' },
        { text: "120 phút trở lên", value: '120 phút trở lên' },
      ],
      onFilter: (v, r) => {
        const duration = r.duration;
        if (v === '0 phút - 60 phút') {
          return duration >= 0 && duration <= 60;
        } else if (v === '60 phút - 90 phút') {
          return duration > 60 && duration <= 90;
        } else if (v === '90 phút - 120 phút') {
          return duration > 90 && duration <= 120;
        }
        else if (v === '120 phút trở lên') {
          return duration > 120;
        }
        return false;
      }
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: img => img && <img width={50} height={50} src={img} alt="" />,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      filters: categories.map(c => ({ text: c.name, value: c.name })),
      onFilter: (v, r) => r.category === v,
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <div>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDeleteService(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} style={{ color: "red" }} />
          </Popconfirm>
          <EditOutlined
            style={{ color: "blue", marginLeft: 12, fontSize: 18, cursor: "pointer" }}
            onClick={() => openEditDrawer(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="pt-4 p-4">
      <h2>Quản Lý Dịch Vụ</h2>
      <Button type="primary" onClick={() => openEditDrawer()} style={{ marginTop: 16 }}>
        Thêm Dịch Vụ
      </Button>
      <Button
        icon={<ReloadOutlined />}
        style={{ float: "right" }}
        onClick={fetchServices}
        loading={isTableLoading}
      >
        Tải lại
      </Button>

      <Spin spinning={isTableLoading} tip="Đang tải..." style={{ marginTop: 16 }}>
        <Table dataSource={services} columns={columns} pagination={{ pageSize: 5 }} />
      </Spin>

      <Drawer
        title={selectService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ"}
        placement="right"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={400}
      >
        <Form layout="vertical" form={form} onFinish={handleFormFinish}>
          <Form.Item
            label="Tên dịch vụ"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item
            label="Thời gian (phút)"
            name="duration"
            rules={[{ required: true, message: "Vui lòng nhập thời gian!" }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item
            label="Danh mục"
            name="category"
            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
          >
            <Select placeholder="Chọn danh mục" allowClear showSearch>
              {categories.map(c => (
                <Option key={c._id} value={c.name}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Hình ảnh">
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={handleImageChange}
              showUploadList
            >
              <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
            </Upload>
            {image && (
              <img src={image} alt="preview" style={{ width: 100, marginTop: 8 }} />
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ServiceManagement;