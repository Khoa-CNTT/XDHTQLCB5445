import React, { useState, useEffect } from 'react';
import { Table, Tag, message, Button, Modal, Spin } from 'antd';
import moment from 'moment'; 
import 'moment/locale/vi'; 
import { deleteBooking, getBookingUser } from '../APIs/booking';
import { useLocation, useNavigate } from 'react-router-dom';
import { errorToast,successToast, } from '../utils/toast';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import qrcode from '../img/Dịch vụ_qrcode.png';

moment.locale('vi');

const ScheduleTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [currentBooking, setCurrentBooking] = useState(null); 
  const [editStatus, setEditStatus] = useState(''); 
  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();

  const bookingStatusOptions = [
    { value: 'Đang xử lý', label: 'Đang xử lý', color: 'orange' },
    { value: 'Đã xác nhận', label: 'Đã xác nhận', color: 'blue' },
    { value: 'Đã hoàn thành', label: 'Đã hoàn thành', color: 'green' },
    { value: 'Đã hủy', label: 'Đã hủy', color: 'red' },
    { value: 'Không đến', label: 'Không đến', color: 'purple' }, 
  ];
  const fetchBookings = async () => {
    setLoading(true);
    try {
      if (!token) {
        errorToast('Vui lòng đăng nhập để xem lịch hẹn.');
        setLoading(false);
        return;
      }

      const res = await getBookingUser(token); 

      if (!Array.isArray(res)) {
        console.error("Expected an array of bookings, received:", res);
        throw new Error("Dữ liệu lịch hẹn không hợp lệ.");
      }

      const sortedBookings = res.sort((a, b) => moment(b.date).diff(moment(a.date)));

      const formatted = sortedBookings.map((b) => ({
        ...b,
        key: b._id, 
        dateFormatted: b.date ? moment(b.date).format('DD/MM/YYYY') : 'N/A',
        timeFormatted: b.time || 'N/A', 
        createdAtFormatted: b.createdAt ? moment(b.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A',
        serviceName: b.service?.name || 'Không xác định',
        branchName: b.branch?.BranchName || 'Không xác định',
        employeeName: b.employee?.UserID?.firstName ? `${b.employee.UserID.firstName} ${b.employee.UserID.lastName || ''}`.trim() : (b.employee?.name || 'Không xác định'),
        statusNormalized: b.status ? b.status.trim() : 'Đang xử lý', 
        totalAmountFormatted: formatPrice(b.totalAmount),
      }));
      setBookings(formatted);
      if (formatted.length === 0 && !loading) { 
           // message.info('Bạn chưa có lịch hẹn nào.'); // Maybe not needed if "empty" state is shown
      }

    } catch (err) {
      console.error("Fetch bookings error:", err);
      errorToast(err.message || 'Lỗi khi tải danh sách lịch hẹn.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBookings();
  }, [location.state?.newBookingId]);
  const getStatusTag = (status) => {
    const match = bookingStatusOptions.find((s) => s.value.toLowerCase() === status?.toLowerCase());
    return (
      <Tag color={match?.color || 'default'} className="text-xs font-medium whitespace-nowrap">
        {match?.label || status || 'N/A'}
      </Tag>
    );
  };
  const formatPrice = (totalAmount) => {
    if (totalAmount === null || totalAmount === undefined || totalAmount === '') return <span className="text-gray-500 italic text-xs">Chưa cập nhật</span>;

    const numericPrice = typeof totalAmount === 'string'
        ? parseFloat(totalAmount.replace(/[^0-9,-]+/g,"").replace(',', '.')) 
        : totalAmount;

    if (isNaN(numericPrice)) return <span className="text-gray-500 italic text-xs">Giá không hợp lệ</span>;

    return numericPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const handleCancelBooking = (bookingId, currentStatus) => {
    Modal.confirm({
      title: 'Xác nhận hủy lịch hẹn',
      icon: <ExclamationCircleOutlined className="text-red-600" />,
      content: 'Bạn có chắc chắn muốn hủy lịch hẹn này không? Hành động này không thể hoàn tác.',
      okText: 'Xác nhận',
      okButtonProps: {
        danger: true,
        className: 'bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700',
      },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          message.loading({ content: 'Đang hủy lịch hẹn...', key: 'deleteBooking' });
          const response = await deleteBooking(bookingId);
          if (response.success) {
            successToast('Hủy lịch hẹn thành công!');
            fetchBookings();
          } else {
            throw new Error(response.message || 'Xóa lịch hẹn thất bại.');
          }
        } catch (err) {
          console.error("Delete booking error:", err);
          message.error({ content: err.message || 'Lỗi khi xóa lịch hẹn.', key: 'deleteBooking', duration: 3 });
        }
      },
    });
  };
  
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setCurrentBooking(null);
    setEditStatus('');
  };

  const columns = [
    {
      title: <span className="font-semibold text-gray-700">Dịch vụ</span>,
      dataIndex: 'serviceName',
      key: 'service',
      render: (text) => <span className="text-sm font-medium text-gray-800">{text}</span>,
    },
    {
      title: <span className="font-semibold text-gray-700">Ngày & Giờ</span>,
      key: 'datetime',
      render: (_, record) => ( 
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">{record.dateFormatted}</span>
          <span className="text-xs text-gray-500">{record.timeFormatted}</span>
        </div>
      ),
    },
    {
      title: <span className="font-semibold text-gray-700">Chi nhánh</span>,
      dataIndex: 'branchName',
      key: 'branch',
      render: (text) => <span className="text-sm text-gray-600">{text}</span>,
    },
    {
      title: <span className="font-semibold text-gray-700">Giá</span>,
      dataIndex: 'totalAmountFormatted',
      key: 'totalAmount',
      render: (text) => <span className="text-sm font-semibold text-pink-700">{text}</span>,
    },
    {
      title: <span className="font-semibold text-gray-700">Trạng thái</span>,
      dataIndex: 'statusNormalized',
      key: 'status',
      render: (status) => getStatusTag(status),
    },

    {
      title: <span className="font-semibold text-gray-700">Hành động</span>,
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => {
          const canCancel = record.statusNormalized !== 'Đã hủy' && record.statusNormalized !== 'Đã hoàn thành' && record.statusNormalized !== 'Đã xác nhận'; ;
          return (
             <div className="flex items-center justify-center">
                <Button
                    type="link"
                    danger 
                    size="small"
                    onClick={() => handleCancelBooking(record._id, record.statusNormalized)}
                    disabled={!canCancel}
                    className={`p-0 h-auto font-medium ${!canCancel ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                    title={!canCancel ? `Không thể hủy lịch hẹn đã ${record.statusNormalized?.toLowerCase()}` : "Hủy lịch hẹn này"}
                >
                    Hủy
                </Button>
                <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setCurrentBooking(record);
                      setIsModalVisible(true);
                    }}
                    className="p-0 ml-4 h-auto font-medium text-blue-600 hover:text-blue-800"
                    title="Xem chi tiết lịch hẹn"
                >
                    Chi tiết
                </Button>
             </div>
          );
      },
    },
  ];

  return (
    <div className="space-y-2">
      
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-semibold text-black-800">Lịch Hẹn Của Tôi</h2>
         <Button
            type="primary"
            onClick={() => navigate('/servicepage')} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm transition duration-150"
         >
            Đặt lịch hẹn mới
          </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spin size="large" />
          <span className="ml-4 text-gray-500">Đang tải lịch hẹn...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-sm border border-pink-100">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Chưa có lịch hẹn nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bạn chưa đặt lịch hẹn nào tại spa.
          </p>
          <div className="mt-6">
            <Button
              type="primary"
              onClick={() => navigate('/servicepage')} 
              className="bg-pink-600 hover:bg-pink-700 border-pink-600 hover:border-pink-700 focus:ring-pink-500 text-white font-semibold rounded-md shadow-sm transition duration-150"
            >
              Đặt lịch ngay
            </Button>
          </div>
        </div>
      ) : (
         <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-pink-100">
            <Table
                columns={columns}
                dataSource={bookings}
                pagination={{
                    pageSize: 5,
                    showSizeChanger: false,
                    className: "p-4",
                }}
                rowClassName="hover:bg-rose-50/50 transition-colors duration-150"
                scroll={{ x: 'max-content' }} 
                locale={{ emptyText: <span className="text-gray-500 italic">Không có dữ liệu.</span> }}
             />
         </div>
      )}

      <Modal
        title={<span className="font-semibold text-lg text-pink-800">Chi tiết lịch hẹn</span>} 
        open={isModalVisible}
        onCancel={handleModalCancel} 
        cancelText="Đóng"
        okButtonProps={{ disabled: !editStatus || !currentBooking, className:"bg-pink-600 hover:bg-pink-700 border-pink-600 hover:border-pink-700"}} 
        cancelButtonProps={{ className:"hover:border-gray-400"}}
        destroyOnClose 
      >
        {currentBooking && (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-2">
                    <p className="text-gray-500 font-medium col-span-1">Dịch vụ:</p>
                    <p className="text-gray-800 col-span-2">{currentBooking.serviceName}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <p className="text-gray-500 font-medium col-span-1">Ngày:</p>
                    <p className="text-gray-800 col-span-2">{currentBooking.dateFormatted}</p>
                </div>
                 <div className="grid grid-cols-3 gap-2">
                    <p className="text-gray-500 font-medium col-span-1">Giờ:</p>
                    <p className="text-gray-800 col-span-2">{currentBooking.timeFormatted}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <p className="text-gray-500 font-medium col-span-1">Chi nhánh:</p>
                    <p className="text-gray-800 col-span-2">{currentBooking.branchName}</p>
                </div>
                 <div className="grid grid-cols-3 gap-2">
                    <p className="text-gray-500 font-medium col-span-1">Giá:</p>
                    <p className="col-span-2 font-semibold text-pink-700">{currentBooking.totalAmountFormatted}</p>
                </div>
                 {currentBooking.notes && (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                        <p className="text-gray-500 font-medium col-span-1">Ghi chú:</p>
                        <p className="text-gray-700 col-span-2 italic">{currentBooking.notes}</p>
                    </div>
                 )}
            </div>
            <div className="flex items-center justify-center mt-4">
                 <img src={qrcode} width={300} height={300} alt="" />
            </div>
          </div>
          
        )}
      </Modal>
    </div>
  );
};

export default ScheduleTab;