import React, { useState, useEffect } from 'react';
import { Button, Drawer, Table, Select, message, Input, Upload, Spin, Form, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { getAllServices, createService, updateService, deleteService } from '../../APIs/ServiceAPI';
import { getBase64 } from '../../utils/ultils';

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
  }, []);

  const fetchServices = async () => {
    setIsTableLoading(true);
    try {
      const response = await getAllServices();
      if (response.success) {
        const fetchedServices = response.data.map(item => ({ ...item, key: item._id }));
        setServices(fetchedServices);
        const uniqueCategories = [...new Set(fetchedServices.map(service => service.category))];
        setCategories(uniqueCategories.map((name, index) => ({ _id: index, name })));
      } else {
        setServices([]);
        setCategories([]);
      }
    } catch (error) {
      
      setServices([]);
      setCategories([]);
    }
    setIsTableLoading(false);
  };


  const openEditDrawer = (service = null) => {
    if (service) {
      setSelectService(service);
      setImage(service.image || null);
      setFileList(service.image ? [{ url: service.image }] : []);
      form.setFieldsValue(service);
    } else {
      setSelectService(null);
      setImage(null);
      setFileList([]);
      form.resetFields();
    }
    setIsDrawerOpen(true);
  };

  const handleDeleteService = async (id) => {
    try {
      await deleteService(id);
      message.success('Xóa dịch vụ thành công!');
      fetchServices();
    } catch (error) {
  
      message.error('Xóa dịch vụ thất bại!');
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

  const handleFormFinish = async (values) => {
    try {
      const payload = {
        ...values,
        image: image || selectService?.image || '',
      };

      if (selectService?._id) {
        await updateService(selectService._id, payload);
        message.success('Cập nhật dịch vụ thành công!');
      } else {
        await createService(payload);
        message.success('Thêm dịch vụ thành công!');
      }

      fetchServices();
      setIsDrawerOpen(false);
    } catch (error) {
    
      message.error('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };
  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description'},
    { title: 'Giá', dataIndex: 'price', key: 'price' },
    { title: 'Thời gian (phút)', dataIndex: 'duration', key: 'duration' },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (img) => img && <img width={50} height={50} src={img} alt="Ảnh dịch vụ" />,
    },
    { title: 'Danh mục', dataIndex: 'category', key: 'category' },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (record) => (
        <div>
         <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDeleteService(record._id)}
            okText="Xoá"
            cancelText="Huỷ"
          >
            <Button style={{color:'red', fontSize:'24px'}} icon={<DeleteOutlined />}  />
          </Popconfirm>
          <EditOutlined
            style={{ color: 'blue', fontSize: '20px', marginLeft: '10px', cursor: 'pointer' }}
            onClick={() => openEditDrawer(record)}
          />
        </div>
      ),
    },
  ];
  return (
    <div className="pt-4 p-4">
      <h2>Quản Lý Dịch Vụ</h2>
      <Button className="bg-blue-600 mt-5" onClick={() => openEditDrawer()}>
        Thêm Dịch Vụ
      </Button>
      <Button
        icon={<ReloadOutlined />}
        className="ml-[90%]"
        onClick={fetchServices}
        loading={isTableLoading}
      >
        Tải lại
      </Button>

      <Spin className="mt-2" tip="Đang tải..." spinning={isTableLoading}>
        <Table
          dataSource={services}
          columns={columns}
          pagination={{ pageSize: 5 }}
        />
      </Spin>

      <Drawer
        title={selectService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ'}
        placement="right"
        closable
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={400}
      >
        <Form layout="vertical" form={form} onFinish={handleFormFinish}>
          <Form.Item
            label="Tên dịch vụ"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item
            label="Thời gian (phút)"
            name="duration"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Danh mục"
            name="category"
            rules={[{ required: true, message: 'Vui lòng nhập hoặc chọn danh mục!' }]}
          >
            <Select
              placeholder="Chọn hoặc nhập danh mục"
              allowClear
              showSearch
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Form.Item name="customCategory" noStyle>
                    <Input
                      placeholder="Nhập danh mục mới"
                      style={{ margin: 8 }}
                      onPressEnter={(e) => {
                        const newCategory = e.target.value.trim();
                        if (newCategory && !categories.find(cat => cat.name === newCategory)) {
                          setCategories([...categories, { _id: Date.now(), name: newCategory }]);
                          form.setFieldsValue({ category: newCategory });
                        }
                      }}
                    />
                  </Form.Item>
                </>
              )}
            >
              {categories.map((category) => (
                <Option key={category._id} value={category.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {category.name}
                  </div>
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
              <img
                src={image}
                alt="Ảnh xem trước"
                style={{ width: 100, height: 100, marginTop: 10 }}
              />
            )}
          </Form.Item>

          <Button className="bg-blue-400" type="primary" htmlType="submit" block>
            Xác nhận
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default ServiceManagement;
