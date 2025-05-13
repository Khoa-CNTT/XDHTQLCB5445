import React, { useState, useEffect } from 'react';
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
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { getProducts, addProduct, updateProduct } from '../../APIs/ProductsApi';
import { getAllCategories } from '../../APIs/categoryApis';
import axios from 'axios';
import TextArea from 'antd/es/input/TextArea';
import { getBase64 } from '../../utils/ultils';

const { Option } = Select;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectProduct, setSelectProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setIsTableLoading(true);
    try {
      const response = await getProducts();
      if (response.success) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setIsTableLoading(false);
    }
  };

const fetchCategories = async () => {
  try {
    const response = await getAllCategories();
    if (response.success && Array.isArray(response.data)) {
      const productCategories = response.data
        .filter(cat => cat.applicableFor === 'Sản phẩm')
        .map(cat => ({ _id: cat._id, name: cat.name }));
      setCategories(productCategories);
    } else {
      setCategories([]);
    }
  } catch (error) {
    setCategories([]);
  }
};
  const openEditDrawer = (product = null) => {
    if (product) {
      setSelectProduct({ ...product });
      setImage(product.ImagePD || null);
      setFileList(product.ImagePD ? [{ url: product.ImagePD }] : []);
      form.setFieldsValue({
        ProductName: product.ProductName,
        DescriptionPD: product.DescriptionPD,
        PricePD: product.PricePD,
        StockQuantity: product.StockQuantity,
        Category: product.Category,
      });
    } else {
      const emptyProduct = {
        ProductName: '',
        DescriptionPD: '',
        PricePD: '',
        StockQuantity: '',
        Category: '',
      };
      setSelectProduct(emptyProduct);
      form.setFieldsValue(emptyProduct);
      setImage(null);
      setFileList([]);
    }
    setIsDrawerOpen(true);
  };

  const handleUpdateProduct = async (values) => {
    setLoading(true);
    try {
      if(!image) {
        message.error('Vui lòng tải lên hình ảnh sản phẩm!');
        return;
      }
      if (values.PricePD < 0 || values.StockQuantity < 0) {
        message.error('Giá và số lượng phải lớn hơn 0!');
        return;
      }
      const updatedData = {
        ...values,
        ImagePD: image || selectProduct?.ImagePD,
      };

      if (selectProduct?._id) {
        await updateProduct(selectProduct._id, updatedData);
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        await addProduct(updatedData);
        message.success('Thêm sản phẩm thành công!');
      }

      fetchProducts();
      setIsDrawerOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const response = await axios.post('https://backend-fu3h.onrender.com/api/product/remove', { id });
      if (response.data.success) {
        message.success('Xóa sản phẩm thành công!');
        fetchProducts();
      }
    } catch (error) {
      message.error('Xóa sản phẩm thất bại!');
    }
  };

  const handleImageChange = async ({ fileList }) => {
    if (fileList.length === 0) {
      setImage(null);
      setFileList([]);
      return;
    }
    const file = fileList[0];
    if (file && !file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setImage(file.preview || file.url);
    setFileList(fileList);
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'ImagePD',
      key: 'ImagePD',
      render: (img) => img && <img width={50} height={50} src={img} alt="Ảnh sản phẩm" />,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'ProductName',
      key: 'ProductName',
      filters: products.map((product) => ({
        text: product.ProductName,
        value: product.ProductName,
      })),
      onFilter: (value, record) =>
        record.ProductName?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Mô tả',
      dataIndex: 'DescriptionPD',
      key: 'DescriptionPD',
      className: 'w-[500px]',
    },
    {
      title: 'Giá',
      dataIndex: 'PricePD',
      key: 'PricePD',
      filters: [
        { text: 'Giá < 100', value: '0-100' },
        { text: 'Giá 100 - 500', value: '100-500' },
        { text: 'Giá > 500', value: '500-999999' },
      ],
      onFilter: (value, record) => {
        const [min, max] = value.split('-').map(Number);
        return record.PricePD >= min && (max ? record.PricePD <= max : true);
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'StockQuantity',
      key: 'StockQuantity',
      filters: [
        { text: 'Số lượng < 10', value: '0-10' },
        { text: 'Số lượng 10 - 50', value: '10-50' },
        { text: 'Số lượng > 50', value: '50-999999' },
      ],
      onFilter: (value, record) => {
        const [min, max] = value.split('-').map(Number);
        return record.StockQuantity >= min && (max ? record.StockQuantity <= max : true);
      },
    },
    {
      title: 'Danh mục',
      dataIndex: 'Category',
      key: 'Category',
      filters: Array.from(new Set(products.map(p => p.Category))).map(category => ({
        text: category,
        value: category,
      })),
      onFilter: (value, record) =>
        record.Category?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (record) => (
        <div>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDeleteProduct(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              style: { backgroundColor: 'blue', color: 'white', borderRadius: '5px' },
            }}
          >
            <DeleteOutlined
              style={{ color: 'red', fontSize: '20px', cursor: 'pointer' }}
            />
          </Popconfirm>
          <EditOutlined
            style={{
              color: 'blue',
              fontSize: '20px',
              marginLeft: '10px',
              cursor: 'pointer',
            }}
            onClick={() => openEditDrawer(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="pt-3">
      <h2>Quản Lý Sản Phẩm</h2>
      <Button className="bg-blue-500 mt-5" onClick={() => openEditDrawer()}>
        Thêm Sản Phẩm
      </Button>
      <Button
        icon={<ReloadOutlined />}
        className="ml-[90%]"
        onClick={fetchProducts}
        loading={isTableLoading}
      >
        Tải lại
      </Button>

      <Spin tip="Đang tải..." spinning={isTableLoading}>
        <Table
          rowKey="_id"
          style={{ marginTop: 20 }}
          dataSource={products}
          columns={columns}
          pagination={{ pageSize: 5 }}
        />
      </Spin>

      <Drawer
        title={selectProduct && selectProduct._id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
        placement="right"
        closable
        onClose={() => {
          setIsDrawerOpen(false);
          form.resetFields();
        }}
        open={isDrawerOpen}
      >
        <Form form={form} onFinish={handleUpdateProduct}>
          <Form.Item
            name="ProductName"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="DescriptionPD"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả sản phẩm!' }]}
          >
            <TextArea />
          </Form.Item>

          <Form.Item
            name="PricePD"
            label="Giá"
            rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm!' }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="StockQuantity"
            label="Số lượng"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="Category"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select
              placeholder="Chọn danh mục"
              allowClear
              showSearch
            >
              {categories.map((category) => (
                <Option key={category._id} value={category.name}>
                  {category.name}
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

          <Form.Item>
            <Button
              className="mt-5 bg-blue-500"
              block
              loading={loading}
              htmlType="submit"
            >
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ProductManagement;
