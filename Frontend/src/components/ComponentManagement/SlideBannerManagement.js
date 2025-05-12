import React, { useEffect, useState } from "react";
import {
  getAllSlides,
  createSlide,
  updateSlide,
  deleteSlide,
} from "../../APIs/bannerApi";
import {
  Table,
  Button,
  Upload,
  message,
  Drawer,
  Form,
  Input,
  Switch,
  Popconfirm,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { getBase64 } from "../../utils/ultils";

const SlideBannerManagement = () => {
  const [slides, setSlides] = useState([]);
  const [image, setImage] = useState("");
  const [fileList, setFileList] = useState([]);
  const [editingSlide, setEditingSlide] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const res = await getAllSlides();
      if (res.success) {
        setSlides(res.data.map((s) => ({ ...s, key: s._id })));
      } else {
        message.error("Không thể tải danh sách slide!");
      }
    } catch (err) {
      
      message.error("Lỗi khi tải slide!");
    }
  };

  const openDrawer = (slide = null) => {
    if (slide) {
      setEditingSlide(slide);
      form.setFieldsValue({
        title: slide.title,
        link: slide.link,
        isActive: slide.isActive ?? true,
      });

      const file = slide.image
        ? {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: slide.image,
          }
        : [];

      setFileList(file ? [file] : []);
      setImage(slide.image || "");
    } else {
      setEditingSlide(null);
      form.resetFields();
      setImage("");
      setFileList([]);
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    form.resetFields();
    setImage("");
    setFileList([]);
    setIsDrawerOpen(false);
  };

  const handleSubmit = async (values) => {
    if (!editingSlide && !image) {
      message.warning("Vui lòng chọn hình ảnh cho slide!");
      return;
    }
    const slideData = {
      ...values,
      image: image || (editingSlide?.image ?? ""),
    };

    try {
      if (editingSlide) {
        await updateSlide(editingSlide._id, slideData);
        message.success("Cập nhật slide thành công!");
      } else {
        await createSlide(slideData);
        message.success("Thêm slide thành công!");
      }
      handleCloseDrawer();
      fetchSlides();
    } catch (error) {
      
      message.error("Lỗi khi thêm/cập nhật slide!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSlide(id);
      message.success("Xóa slide thành công!");
      fetchSlides();
    } catch (error) {
      
      message.error("Lỗi khi xóa slide!");
    }
  };

  const handleImageChange = async ({ fileList: newFileList }) => {
    if (!newFileList.length) {
      setImage("");
      setFileList([]);
      return;
    }

    const file = newFileList[0];

    if (!file.url && !file.preview) {
      try {
        file.preview = await getBase64(file.originFileObj);
      } catch (error) {
        
        message.error("Không thể đọc file ảnh!");
      }
    }

    setImage(file.url || file.preview || "");
    setFileList([file]);
  };

  const columns = [
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    { title: "Nội dung", dataIndex: "link", key: "link" },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (img) =>
        img && <img width={100} height={50} src={img} alt="Slide" />,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Switch checked={isActive} disabled style={{ marginLeft: 10 }} />
      ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <span>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa slide này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              style: {
                backgroundColor: "blue",
                color: "white",
                borderRadius: "5px",
              },
            }}
          >
            <DeleteOutlined
              style={{
                color: "red",
                fontSize: "20px",
                cursor: "pointer",
              }}
            />
          </Popconfirm>
          <EditOutlined
            onClick={() => openDrawer(record)}
            style={{
              marginLeft: 10,
              color: "blue",
              fontSize: "20px",
              cursor: "pointer",
            }}
          />
        </span>
      ),
    },
  ];

  return (
    <div className="mt-3">
      <h2>Quản lý Slide Banner</h2>
      <Button
        className="bg-blue-500 mt-5"
        icon={<PlusOutlined />}
        onClick={() => openDrawer()}
      >
        Thêm Slide
      </Button>

      <Table
        dataSource={slides}
        columns={columns}
        pagination={{ pageSize: 5 }}
        className="mt-4"
      />

      <Drawer
        title={editingSlide ? "Cập nhật Slide" : "Thêm Slide"}
        onClose={handleCloseDrawer}
        open={isDrawerOpen}
        width={400}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Nội dung"
            name="link"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Hình ảnh">
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={handleImageChange}
              showUploadList
            >
              <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
            </Upload>
            {image && (
              <img
                src={image}
                alt="Preview"
                style={{ width: 100, height: 100, marginTop: 10 }}
              />
            )}
          </Form.Item>

          <Form.Item
            label="Hiển thị"
            name="isActive"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button className="bg-blue-500" block htmlType="submit">
              {editingSlide ? "Cập nhật" : "Thêm Slide"}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default SlideBannerManagement;
