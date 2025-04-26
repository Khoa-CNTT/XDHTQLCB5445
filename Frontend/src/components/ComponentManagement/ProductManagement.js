<<<<<<< HEAD
import React, { useState, useEffect } from "react";
=======
import React, { useState, useEffect } from 'react';
>>>>>>> c1949cc (Bao cao lan 3)
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
<<<<<<< HEAD
} from "antd";
=======
} from 'antd';
>>>>>>> c1949cc (Bao cao lan 3)
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  UploadOutlined,
<<<<<<< HEAD
} from "@ant-design/icons";
import { getProducts, addProduct, updateProduct } from "../../APIs/ProductsApi";
import axios from "axios";
import { PRcategories } from "../../utils/data";
import TextArea from "antd/es/input/TextArea";
import { getBase64 } from "../../utils/ultils";
=======
} from '@ant-design/icons';
import { getProducts, addProduct, updateProduct } from '../../APIs/ProductsApi';
import axios from 'axios';
import TextArea from 'antd/es/input/TextArea';
import { getBase64 } from '../../utils/ultils';
>>>>>>> c1949cc (Bao cao lan 3)

const { Option } = Select;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectProduct, setSelectProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(true);
<<<<<<< HEAD
=======
  const [categories, setCategories] = useState([]);
>>>>>>> c1949cc (Bao cao lan 3)
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsTableLoading(true);
    try {
      const response = await getProducts();
      if (response.success) {
        setProducts(response.data);
<<<<<<< HEAD
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
=======
        const uniqueCategories = [...new Set(response.data.map(product => product.Category))];
        setCategories(uniqueCategories.map((name, index) => ({ _id: index, name })));
      } else {
        setProducts([]);
      }
    } catch (error) {
  
>>>>>>> c1949cc (Bao cao lan 3)
      setProducts([]);
    } finally {
      setIsTableLoading(false);
    }
  };
<<<<<<< HEAD

=======
>>>>>>> c1949cc (Bao cao lan 3)
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
<<<<<<< HEAD
        ProductName: "",
        DescriptionPD: "",
        PricePD: "",
        StockQuantity: "",
        Category: "",
=======
        ProductName: '',
        DescriptionPD: '',
        PricePD: '',
        StockQuantity: '',
        Category: '',
>>>>>>> c1949cc (Bao cao lan 3)
      };
      setSelectProduct(emptyProduct);
      form.setFieldsValue(emptyProduct);
      setImage(null);
      setFileList([]);
    }
    setIsDrawerOpen(true);
  };
<<<<<<< HEAD

=======
>>>>>>> c1949cc (Bao cao lan 3)
  const handleUpdateProduct = async (values) => {
    setLoading(true);
    try {
      const updatedData = {
        ...values,
<<<<<<< HEAD
        ImagePD: image || selectProduct.ImagePD,
=======
        ImagePD: image || selectProduct?.ImagePD,
>>>>>>> c1949cc (Bao cao lan 3)
      };

      if (selectProduct?._id) {
        await updateProduct(selectProduct._id, updatedData);
<<<<<<< HEAD
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        await addProduct(updatedData);
        message.success("Thêm sản phẩm thành công!");
=======
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        await addProduct(updatedData);
        message.success('Thêm sản phẩm thành công!');
>>>>>>> c1949cc (Bao cao lan 3)
      }

      fetchProducts();
      setIsDrawerOpen(false);
      form.resetFields();
    } catch (error) {
<<<<<<< HEAD
      console.error("Lỗi khi lưu sản phẩm:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại.");
=======
      
      message.error('Có lỗi xảy ra, vui lòng thử lại.');
>>>>>>> c1949cc (Bao cao lan 3)
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
<<<<<<< HEAD
      const response = await axios.post(
        "http://localhost:4000/api/product/remove",
        { id }
      );
      if (response.data.success) {
        message.success("Xóa sản phẩm thành công!");
        fetchProducts();
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      message.error("Xóa sản phẩm thất bại!");
=======
      const response = await axios.post('https://backend-fu3h.onrender.com/api/product/remove', { id });
      if (response.data.success) {
        message.success('Xóa sản phẩm thành công!');
        fetchProducts();
      }
    } catch (error) {
  
      message.error('Xóa sản phẩm thất bại!');
>>>>>>> c1949cc (Bao cao lan 3)
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
<<<<<<< HEAD
      title: "Ảnh",
      dataIndex: "ImagePD",
      key: "ImagePD",
      render: (img) =>
        img && <img width={50} height={50} src={img} alt="Ảnh sản phẩm" />,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "ProductName",
      key: "ProductName",
=======
      title: 'Ảnh',
      dataIndex: 'ImagePD',
      key: 'ImagePD',
      render: (img) => img && <img width={50} height={50} src={img} alt="Ảnh sản phẩm" />,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'ProductName',
      key: 'ProductName',
>>>>>>> c1949cc (Bao cao lan 3)
      filters: products.map((product) => ({
        text: product.ProductName,
        value: product.ProductName,
      })),
      onFilter: (value, record) =>
        record.ProductName?.toLowerCase().includes(value.toLowerCase()),
    },
    {
<<<<<<< HEAD
      title: "Mô tả",
      dataIndex: "DescriptionPD",
      key: "DescriptionPD",
      className: "w-[500px]",
    },
    { title: "Giá", dataIndex: "PricePD", key: "PricePD" },
    { title: "Số lượng", dataIndex: "StockQuantity", key: "StockQuantity" },
    { title: "Danh mục", dataIndex: "Category", key: "Category" },
    {
      title: "Hành động",
      key: "action",
=======
      title: 'Mô tả',
      dataIndex: 'DescriptionPD',
      key: 'DescriptionPD',
      className: 'w-[500px]',
    },
    { title: 'Giá', dataIndex: 'PricePD', key: 'PricePD' },
    { title: 'Số lượng', dataIndex: 'StockQuantity', key: 'StockQuantity' },
    { title: 'Danh mục', dataIndex: 'Category', key: 'Category' },
    {
      title: 'Hành động',
      key: 'action',
>>>>>>> c1949cc (Bao cao lan 3)
      render: (record) => (
        <div>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDeleteProduct(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
<<<<<<< HEAD
              style: { backgroundColor: "blue", color: "white", borderRadius: "5px" },
            }}
          >
            <DeleteOutlined
              style={{ color: "red", fontSize: "20px", cursor: "pointer" }}
=======
              style: { backgroundColor: 'blue', color: 'white', borderRadius: '5px' },
            }}
          >
            <DeleteOutlined
              style={{ color: 'red', fontSize: '20px', cursor: 'pointer' }}
>>>>>>> c1949cc (Bao cao lan 3)
            />
          </Popconfirm>
          <EditOutlined
            style={{
<<<<<<< HEAD
              color: "blue",
              fontSize: "20px",
              marginLeft: "10px",
              cursor: "pointer",
=======
              color: 'blue',
              fontSize: '20px',
              marginLeft: '10px',
              cursor: 'pointer',
>>>>>>> c1949cc (Bao cao lan 3)
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
<<<<<<< HEAD
        title={
          selectProduct && selectProduct._id
            ? "Chỉnh sửa sản phẩm"
            : "Thêm sản phẩm"
        }
=======
        title={selectProduct && selectProduct._id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
>>>>>>> c1949cc (Bao cao lan 3)
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
<<<<<<< HEAD
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
=======
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
>>>>>>> c1949cc (Bao cao lan 3)
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="DescriptionPD"
            label="Mô tả"
<<<<<<< HEAD
            rules={[{ required: true, message: "Vui lòng nhập mô tả sản phẩm!" }]}
=======
            rules={[{ required: true, message: 'Vui lòng nhập mô tả sản phẩm!' }]}
>>>>>>> c1949cc (Bao cao lan 3)
          >
            <TextArea />
          </Form.Item>

          <Form.Item
            name="PricePD"
            label="Giá"
<<<<<<< HEAD
            rules={[{ required: true, message: "Vui lòng nhập giá sản phẩm!" }]}
=======
            rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm!' }]}
>>>>>>> c1949cc (Bao cao lan 3)
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="StockQuantity"
            label="Số lượng"
<<<<<<< HEAD
            rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
=======
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
>>>>>>> c1949cc (Bao cao lan 3)
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="Category"
            label="Danh mục"
<<<<<<< HEAD
            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
          >
            <Select>
              {PRcategories.map((category) => (
                <Option key={category.id} value={category.name}>
                  {category.name}
=======
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
                          form.setFieldsValue({ Category: newCategory });
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
>>>>>>> c1949cc (Bao cao lan 3)
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
