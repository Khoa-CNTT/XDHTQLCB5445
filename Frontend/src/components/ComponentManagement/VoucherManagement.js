import React, { useState, useEffect } from 'react';
import {
  Button, Drawer, Table, Select, Input, Spin,
  Form, DatePicker, Popconfirm, message,
} from 'antd';
import { DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  addVoucher, getVouchers, updateVoucher, deleteVoucher,
} from '../../APIs/VoucherAPI';

const { Option } = Select;

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [selectVoucher, setSelectVoucher] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [voucherCodeFilter, setVoucherCodeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | expired
  const [form] = Form.useForm();

  useEffect(() => {
    fetchVouchers();
  }, [voucherCodeFilter, statusFilter]);

  const fetchVouchers = async () => {
    setIsTableLoading(true);
    try {
      const data = await getVouchers();
      const now = dayjs();

      const filtered = data
        .map(v => ({ ...v, key: v._id }))
        .filter(v => v.code.toLowerCase().includes(voucherCodeFilter.toLowerCase()))
        .filter(v => {
          if (statusFilter === 'active') {
            return dayjs(v.endDate).isAfter(now);
          }
          if (statusFilter === 'expired') {
            return dayjs(v.endDate).isBefore(now);
          }
          return true;
        });

      setVouchers(filtered);
    } catch {
      message.error('Không thể tải danh sách voucher.');
    } finally {
      setIsTableLoading(false);
    }
  };

  const openEditDrawer = (voucher = null) => {
    setSelectVoucher(voucher);
    setIsDrawerOpen(true);

    if (voucher) {
      form.setFieldsValue({
        ...voucher,
        startDate: dayjs(voucher.startDate),
        endDate: dayjs(voucher.endDate),
      });
    } else {
      form.resetFields();
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectVoucher(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (values.startDate.isAfter(values.endDate)) {
        message.error('Ngày bắt đầu đang lớn hơn ngày kết thúc!');
        return;
      }
      if (values.usageLimit < 1) {
        message.error('Giới hạn sử dụng phải lớn hơn 0!');
        return;
      }
      if (values.discount < 1 || values.discount > 99) {
        message.error('Giảm giá phải nằm trong khoảng 1-99%!');
        return;
      }
      if (values.maximumDiscount < 1) {
        message.error('Giảm tối đa phải lớn hơn 0!');
        return;
      }
      if (values.minimumAmount < 0) {
        message.error('Đơn tối thiểu không được âm!');
        return;
      }

      const payload = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };

      setLoading(true);
      if (selectVoucher?._id) {
        await updateVoucher(selectVoucher._id, payload);
        message.success('Cập nhật voucher thành công!');
      } else {
        await addVoucher(payload);
        message.success('Thêm voucher thành công!');
      }
      closeDrawer();
      fetchVouchers();
    } catch (error) {
      // handle validate error silently
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVoucher = async (id) => {
    try {
      await deleteVoucher(id);
      message.success('Xóa voucher thành công!');
      fetchVouchers();
    } catch {
      message.error('Xóa voucher thất bại!');
    }
  };

  //   { title: 'Mã', dataIndex: 'code' },
  //   { title: 'Giảm giá (%)', dataIndex: 'discount' ,
      
  //   },
  //   { title: 'Giảm tối đa', dataIndex: 'maximumDiscount' },
  //   { title: 'Đơn tối thiểu', dataIndex: 'minimumAmount' },
  //   {
  //     title: 'Ngày bắt đầu',
  //     dataIndex: 'startDate',
  //     render: (date) => new Date(date).toLocaleDateString(),
  //   },
  //   {
  //     title: 'Ngày kết thúc',
  //     dataIndex: 'endDate',
  //     render: (date) => new Date(date).toLocaleDateString(),
  //   },
  //   { title: 'Giới hạn sử dụng', dataIndex: 'usageLimit' },
  //   {
  //     title: 'Số lượt dùng',
  //     dataIndex: 'usageLeft',
  //     render: (v) => v ?? 0,
  //   },
  //   {
  //     title: 'Áp dụng cho',
  //     dataIndex: 'applicableTo',
  //     render: (v) => v === 'all' ? 'Tất cả' : v === 'products' ? 'Sản phẩm' : 'Dịch vụ',
  //   },
  //   {
  //     title: 'Hành động',
  //     render: (record) => (
  //       <div>
  //         <Popconfirm
  //           title="Xác nhận xóa voucher này?"
  //           onConfirm={() => handleDeleteVoucher(record._id)}
  //           okText="Xóa"
  //           cancelText="Hủy"
  //         >
  //           <DeleteOutlined style={{ color: 'red', fontSize: 20, cursor: 'pointer' }} />
  //         </Popconfirm>
  //         <EditOutlined
  //           style={{ color: 'blue', fontSize: 20, marginLeft: 10, cursor: 'pointer' }}
  //           onClick={() => openEditDrawer(record)}
  //         />
  //       </div>
  //     ),
  //   },
  // ];
  const columns = [
    { title: 'Mã', dataIndex: 'code' },
    {
      title: 'Giảm giá (%)',
      dataIndex: 'discount',
      filters: [...new Set(vouchers.map(v => v.discount))].map(discount => ({
        text: `${discount}%`,
        value: discount,
      })),
      onFilter: (value, record) => record.discount === value,
    },
    
    { title: 'Giảm tối đa', dataIndex: 'maximumDiscount',
      filters: [...new Set(vouchers.map(v => v.maximumDiscount))].map(maximumDiscount => ({
        text: `${maximumDiscount}`,
        value: maximumDiscount,
      })),
      onFilter: (value, record) => record.maximumDiscount === value,
     },
    { title: 'Đơn tối thiểu', dataIndex: 'minimumAmount',
      filters: [...new Set(vouchers.map(v => v.minimumAmount))].map(minimumAmount => ({
        text: `${minimumAmount}`,
        value: minimumAmount,
      })),
      onFilter: (value, record) => record.minimumAmount === value,
     },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    { title: 'Giới hạn sử dụng', dataIndex: 'usageLimit' ,
      filters: [...new Set(vouchers.map(v => v.usageLimit))].map(usageLimit => ({
        text: `${usageLimit}`,
        value: usageLimit,
      })),
      onFilter: (value, record) => record.usageLimit === value,
    },
    {
      title: 'Số lượt dùng',
      dataIndex: 'usageLeft',
      render: (v) => v ?? 0,
    },
    {
      title: 'Áp dụng cho',
      dataIndex: 'applicableTo',
      filters: [
        { text: 'Tất cả', value: 'all' },
        { text: 'Dịch vụ', value: 'services' },
        { text: 'Sản phẩm', value: 'products' },
      ],
      onFilter: (value, record) => record.applicableTo === value,
      render: (v) =>
        v === 'all' ? 'Tất cả' : v === 'products' ? 'Sản phẩm' : 'Dịch vụ',
    },
    {
      title: 'Hành động',
      render: (record) => (
        <div>
          <Popconfirm
            title="Xác nhận xóa voucher này?"
            onConfirm={() => handleDeleteVoucher(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <DeleteOutlined style={{ color: 'red', fontSize: 20, cursor: 'pointer' }} />
          </Popconfirm>
          <EditOutlined
            style={{ color: 'blue', fontSize: 20, marginLeft: 10, cursor: 'pointer' }}
            onClick={() => openEditDrawer(record)}
          />
        </div>
      ),
    },
  ];
  
  return (
    <div className="pt-5 p-4">
      <h2>Quản Lý Voucher</h2>

      <div className="flex gap-4 mt-4 mb-6">
        <Button className="bg-blue-500" onClick={() => openEditDrawer()}>Thêm Voucher</Button>
        <Button onClick={() => setStatusFilter('active')}>Còn sử dụng</Button>
        <Button onClick={() => setStatusFilter('expired')}>Đã hết hạn</Button>
        <Button icon={<ReloadOutlined />} onClick={() => setStatusFilter('all')}>Tải lại</Button>
      </div>

      <Spin tip="Đang tải dữ liệu..." spinning={isTableLoading}>
        <Table
          style={{ marginTop: 20 }}
          dataSource={vouchers}
          columns={columns}
          pagination={{ pageSize: 5 }}
        />
      </Spin>

      <Drawer
        title={selectVoucher ? 'Chỉnh sửa voucher' : 'Thêm voucher'}
        placement="right"
        onClose={closeDrawer}
        open={isDrawerOpen}
        width={400}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="code" label="Mã voucher" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="discount" label="Giảm giá (%)" rules={[{ required: true }]}>
            <Input type="number" min={1} max={99} />
          </Form.Item>
          <Form.Item name="maximumDiscount" label="Giảm tối đa" rules={[{ required: true }]}>
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item name="minimumAmount" label="Đơn tối thiểu" rules={[{ required: true }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}>
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true }]}>
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="usageLimit" label="Giới hạn sử dụng" rules={[{ required: true }]}>
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item name="applicableTo" label="Áp dụng cho" rules={[{ required: true }]}>
            <Select>
              <Option value="all">Tất cả</Option>
              <Option value="services">Dịch vụ</Option>
              <Option value="products">Sản phẩm</Option>
            </Select>
          </Form.Item>
          <Button
            className="bg-blue-500"
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

export default VoucherManagement;
