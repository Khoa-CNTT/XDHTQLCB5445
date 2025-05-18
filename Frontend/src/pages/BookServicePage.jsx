import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DatePicker,
  TimePicker,
  Select,
  Button,
  Form,
  Spin,
  Card,
  Descriptions,
  Modal,
  Row,
  Col,
  Typography,
  Radio,
} from "antd";
// Bỏ import moment vì đã dùng dayjs nhất quán hơn
// import moment from "moment";
import { listBranch } from "../APIs/brand"; // Đảm bảo đường dẫn đúng
import { listEmployee, getEmployeeBookings } from "../APIs/employee"; // Đảm bảo đường dẫn đúng
import { bookService } from "../APIs/booking"; // Đảm bảo đường dẫn đúng
import { errorToast, successToast } from "../utils/toast"; // Đảm bảo đường dẫn đúng
import axios from "axios";
import { Tag as LucideTag } from "lucide-react"; // Đổi tên để tránh trùng với Ant Design Tag nếu có
import { redeemVoucher } from "../APIs/VoucherAPI"; // Đảm bảo đường dẫn đúng
import Header from "../components/Header"; // Đảm bảo đường dẫn đúng
import dayjs from 'dayjs';
import 'dayjs/locale/vi'; // Import locale tiếng Việt cho dayjs nếu cần hiển thị ngày tháng tiếng Việt
dayjs.locale('vi'); // Set locale toàn cục cho dayjs

const { Option } = Select;
const { Text } = Typography;

const API_BASE_URL = "http://localhost:4000/api/"; // Cấu hình API base URL của bạn
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const BookServicePage = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false); // Loading chung cho các tác vụ chính
  const [employeeLoading, setEmployeeLoading] = useState(false); // Loading khi tải nhân viên
  const [service, setService] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [employeeBookings, setEmployeeBookings] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isVoucherModalVisible, setIsVoucherModalVisible] = useState(false);

  const [employeeSelectionMode, setEmployeeSelectionMode] = useState("manual");
  const [autoSelectedEmployeeId, setAutoSelectedEmployeeId] = useState(null);


  useEffect(() => {
    if (location.state?.service) {
      const parsedService = {
        ...location.state.service,
        price:
          parseFloat(
            String(location.state.service.price)
              .replace(/\./g, "")
              .replace(",", ".")
          ) || 0,
      };
      setService(parsedService);
    } else {
      errorToast("Không tìm thấy thông tin dịch vụ để đặt lịch.");
      // Cân nhắc điều hướng người dùng nếu không có dịch vụ
      // navigate('/');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (service) {
      fetchBranches();
      fetchSavedVouchers();
    }
  }, [service]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await listBranch();
      if (Array.isArray(response.data)) {
        setBranches(response.data);
      } else {
        errorToast("Dữ liệu chi nhánh không đúng định dạng");
        setBranches([]);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      errorToast("Không thể tải danh sách chi nhánh");
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesByBranch = async (branchId) => {
    if (!branchId) {
      setEmployees([]);
      form.setFieldsValue({ employee: undefined });
      setAutoSelectedEmployeeId(null);
      return;
    }

    try {
      setEmployeeLoading(true);
      const response = await listEmployee();

      if (!Array.isArray(response.data)) {
        errorToast("Dữ liệu nhân viên không đúng định dạng");
        setEmployees([]);
        setAutoSelectedEmployeeId(null);
        return;
      }

      const normalizedEmployees = response.data.map((emp) => ({ // Chuẩn hóa dữ liệu nếu cần
        ...emp,
        branchInfo: emp.BranchID,
        userInfo: emp.User,
        status: emp.Status,
        position: emp.Position,
      }));

      const filteredEmployees = normalizedEmployees.filter((emp) => {
        const empBranchId =
          (typeof emp.branchInfo === "object"
            ? emp.branchInfo?._id
            : emp.branchInfo) ||
          emp.BranchID?._id ||
          emp.BranchID;

        return (
          empBranchId === branchId &&
          emp.status?.trim().toLowerCase() !== "nghỉ việc" &&
          emp.position?.trim().toLowerCase() !== "nhân viên dịch vụ" // Xem lại logic này nếu cần
        );
      });

      setEmployees(filteredEmployees);
      if (filteredEmployees.length > 0) {
        if (employeeSelectionMode === "auto") {
          const randomEmp = filteredEmployees[Math.floor(Math.random() * filteredEmployees.length)];
          setAutoSelectedEmployeeId(randomEmp._id);
          handleEmployeeChange(randomEmp._id, form.getFieldValue("date")); // Gọi với ID đã random
        } else {
          form.setFieldsValue({ employee: undefined });
        }
      } else {
        form.setFieldsValue({ employee: undefined });
        setAutoSelectedEmployeeId(null);
      }

    } catch (error) {
      console.error("Error fetching employees:", error);
      errorToast("Không thể tải danh sách nhân viên");
      setEmployees([]);
      setAutoSelectedEmployeeId(null);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const fetchEmployeeBookings = async (employeeIdToFetch, date) => {
    if (!employeeIdToFetch || !date) {
      setEmployeeBookings([]);
      return;
    }
    try {
      const response = await getEmployeeBookings(
        employeeIdToFetch,
        date.format("YYYY-MM-DD") // date là dayjs object
      );
      if (Array.isArray(response.data)) {
        setEmployeeBookings(response.data);
      } else {
        setEmployeeBookings([]);
      }
    } catch (error) {
      console.error("Error fetching employee bookings:", error);
      setEmployeeBookings([]);
    }
  };

  const fetchSavedVouchers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setVouchers([]);
        return;
      }
      const response = await api.get("/vouchers/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formattedVouchers = response.data
        .filter((voucher) => ["all", "services"].includes(voucher.applicableTo))
        .map((voucher) => ({
          ...voucher,
          title: `Ưu đãi ${voucher.applicableTo === "services" ? "dịch vụ" : "tất cả"
            }`,
          discount: Number(voucher.discount) || 0,
          expiry: `HSD: ${dayjs(voucher.endDate).format("DD/MM/YYYY")}`, // Sử dụng dayjs
          tags: [
            voucher.applicableTo === "services" ? "Dịch vụ" : "Tất cả",
            dayjs().isAfter(dayjs(voucher.endDate)) ? "Hết hạn" : "Còn hiệu lực", // Sử dụng dayjs
          ],
          minOrder:
            voucher.minimumAmount > 0
              ? `Đơn hàng từ ${voucher.minimumAmount.toLocaleString()} đ`
              : null,
        }));
      setVouchers(formattedVouchers);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      errorToast("Lỗi khi lấy danh sách voucher");
    }
  };

  const handleBranchChange = (branchId) => {
    form.setFieldsValue({ employee: undefined });
    setAutoSelectedEmployeeId(null);
    setEmployeeBookings([]);
    if (branchId) {
      fetchEmployeesByBranch(branchId);
    } else {
      setEmployees([]);
    }
  };

  const handleEmployeeSelectionModeChange = (e) => {
    const newMode = e.target.value;
    setEmployeeSelectionMode(newMode);
    setEmployeeBookings([]);

    if (newMode === 'manual') {
      setAutoSelectedEmployeeId(null);
    } else {
      form.setFieldsValue({ employee: undefined });
      const currentBranch = form.getFieldValue("branch");
      if (currentBranch && employees.length > 0) {
        const randomEmp = employees[Math.floor(Math.random() * employees.length)];
        setAutoSelectedEmployeeId(randomEmp._id);
        handleEmployeeChange(randomEmp._id, form.getFieldValue("date"));
      } else {
        setAutoSelectedEmployeeId(null);
      }
    }
  };

  const handleEmployeeChange = (employeeIdArg, dateArg) => {
    const currentDate = dateArg || form.getFieldValue("date"); // dateArg là dayjs object
    let finalEmployeeIdToFetchBookings = null;

    if (employeeSelectionMode === 'manual') {
      finalEmployeeIdToFetchBookings = employeeIdArg;
    } else if (employeeSelectionMode === 'auto') {
      finalEmployeeIdToFetchBookings = autoSelectedEmployeeId;
    }

    if (finalEmployeeIdToFetchBookings && currentDate) {
      fetchEmployeeBookings(finalEmployeeIdToFetchBookings, currentDate);
    } else {
      setEmployeeBookings([]);
    }
  };

  const handleWheel = (e) => {
    if (document.querySelector(".ant-picker-dropdown")) {
      e.preventDefault();
    }
  };

  const handleOpenChange = (open) => {
    if (open) {
      window.addEventListener("wheel", handleWheel, { passive: false });
    } else {
      window.removeEventListener("wheel", handleWheel);
    }
  };

  const handleDateChange = (date) => { // date là dayjs object từ DatePicker
    const currentEmployeeId = employeeSelectionMode === 'auto'
      ? autoSelectedEmployeeId
      : form.getFieldValue("employee");

    if (currentEmployeeId && date) {
      fetchEmployeeBookings(currentEmployeeId, date);
    }
  };

  const disabledTime = () => {
    const allowedHours = Array.from({ length: 11 }, (_, i) => i + 8); // 8AM to 6PM (18:00)
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    const disabledHours = allHours.filter((h) => !allowedHours.includes(h));
    return {
      disabledHours: () => disabledHours,
      disabledMinutes: (hour) => (hour < 8 || hour > 18 ? Array.from({ length: 60 }, (_, i) => i).filter(m => m !== 0 && m !== 30) : []),
    };
  };

  const isTimeSlotAvailable = (employeeId, date, time, duration) => {
    if (!employeeId || !date || !time || !duration || !service) return true;

    const selectedDateStr = date.format("YYYY-MM-DD"); // date là dayjs object
    const selectedTimeStr = time.format("HH:mm"); // time là dayjs object
    const selectedStart = convertTimeToMinutes(selectedTimeStr);
    const selectedEnd = selectedStart + duration;

    const dayBookings = employeeBookings.filter(
      (booking) => dayjs(booking.date).format("YYYY-MM-DD") === selectedDateStr && booking.status !== 'cancelled'
    );

    for (const booking of dayBookings) {
      const bookingStart = convertTimeToMinutes(booking.time);
      const bookingDuration = booking.duration || service.duration;
      const bookingEnd = bookingStart + bookingDuration;
      if (
        (selectedStart >= bookingStart && selectedStart < bookingEnd) ||
        (selectedEnd > bookingStart && selectedEnd <= bookingEnd) ||
        (selectedStart <= bookingStart && selectedEnd >= bookingEnd)
      ) {
        return false;
      }
    }
    return true;
  };

  const convertTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const showVoucherModal = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      errorToast("Vui lòng đăng nhập để chọn voucher!");
      return;
    }
    setIsVoucherModalVisible(true);
  };

  const handleVoucherCancel = () => {
    setIsVoucherModalVisible(false);
  };

  const applyVoucher = (voucher) => {
    if (!service) return;
    const currentDate = dayjs();
    const startDate = dayjs(voucher.startDate);
    const endDate = dayjs(voucher.endDate);

    if (currentDate.isBefore(startDate) || currentDate.isAfter(endDate)) {
      errorToast("Voucher không còn hiệu lực");
      return;
    }

    if (service.price < (voucher.minimumAmount || 0)) {
      errorToast(
        `Dịch vụ phải có giá trị tối thiểu ${(
          voucher.minimumAmount || 0
        ).toLocaleString("vi-VN")} ₫ để áp dụng voucher này.`
      );
      return;
    }

    setSelectedVoucher(voucher);
    successToast(`Áp dụng voucher ${voucher.code} thành công!`);
    setIsVoucherModalVisible(false);
  };

  const calculateDiscount = () => {
    if (!selectedVoucher || !service) return 0;
    let discountPercent = Number(selectedVoucher.discount) || 0;
    let maxDiscount = Number(selectedVoucher.maximumDiscount) || Infinity;
    let discountAmount = service.price * (discountPercent / 100);
    discountAmount = Math.min(discountAmount, maxDiscount);
    return Math.round(discountAmount);
  };

  const subtotal = service ? service.price : 0;
  const discount = calculateDiscount();
  const totalPayment = subtotal - discount > 0 ? subtotal - discount : 0;

  const checkAvailabilityBeforeSubmit = async () => {
    const values = await form.validateFields();

    if (!service || !service._id || !service.duration) {
      errorToast("Thiếu thông tin dịch vụ");
      return false;
    }

    const timeObj = dayjs(values.time); // values.time là dayjs object từ Form
    const dateObj = dayjs(values.date); // values.date là dayjs object từ Form
    const now = dayjs();
    const selectedDateTime = dateObj.hour(timeObj.hour()).minute(timeObj.minute());

    if (now.isAfter(selectedDateTime)) {
      errorToast("Thời gian đặt lịch đã qua. Vui lòng chọn thời gian trong tương lai.");
      return false;
    }

    const { branch } = values; // time và date đã được lấy ở trên (timeObj, dateObj)

    if (!branch || !dateObj || !timeObj) {
      errorToast("Vui lòng điền đầy đủ thông tin chi nhánh, ngày và giờ đặt lịch");
      return false;
    }

    const employeeIdForCheck = employeeSelectionMode === 'auto'
      ? autoSelectedEmployeeId
      : values.employee;

    if (!employeeIdForCheck) {
      if (employeeSelectionMode === 'auto') {
        if (form.getFieldValue('branch') && employees.length === 0 && !employeeLoading) {
          errorToast("Chi nhánh này hiện không có nhân viên để tự động chọn.");
        } else if (form.getFieldValue('branch') && employees.length > 0 && !autoSelectedEmployeeId) {
          errorToast("Hệ thống đang xử lý việc chọn nhân viên. Vui lòng đợi hoặc thử lại.");
        }
        else if (form.getFieldValue('branch')) {
          errorToast("Hệ thống chưa chọn được nhân viên. Vui lòng thử lại hoặc chọn thủ công.");
        } else {
          errorToast("Vui lòng chọn chi nhánh trước.");
        }
      } else {
        errorToast("Vui lòng chọn nhân viên.");
      }
      return false;
    }

    setCheckingAvailability(true);
    try {
      // Gọi lại fetchEmployeeBookings để đảm bảo dữ liệu mới nhất trước khi kiểm tra
      // Vì state employeeBookings có thể chưa kịp cập nhật nếu người dùng thay đổi nhanh
      await fetchEmployeeBookings(employeeIdForCheck, dateObj);

      // Đợi một chút để state employeeBookings có thể được cập nhật sau khi fetch
      // Đây là một giải pháp tạm thời, cách tốt hơn là sử dụng callback hoặc promise từ fetchEmployeeBookings
      await new Promise(resolve => setTimeout(resolve, 100));


      const isAvailable = isTimeSlotAvailable(
        employeeIdForCheck,
        dateObj, // dayjs object
        timeObj, // dayjs object
        service.duration
      );

      if (!isAvailable) {
        errorToast(
          "Nhân viên đã có lịch trong khung giờ này. Vui lòng chọn thời gian khác."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking availability:", error);
      errorToast("Có lỗi khi kiểm tra khung giờ");
      return false;
    } finally {
      setCheckingAvailability(false);
    }
  };

  const onFinish = async (values) => {
    setServerError(null);

    const finalEmployeeId = employeeSelectionMode === 'auto'
      ? autoSelectedEmployeeId
      : values.employee;

    if (!finalEmployeeId) {
      if (employeeSelectionMode === 'auto') {
        errorToast("Không thể xác định nhân viên. Vui lòng thử lại hoặc chọn thủ công.");
      } else {
        errorToast("Vui lòng chọn nhân viên.");
      }
      return;
    }

    const isAvailable = await checkAvailabilityBeforeSubmit();
    if (!isAvailable) return;

    const token = localStorage.getItem("token");
    if (!token) {
      errorToast("Vui lòng đăng nhập để đặt lịch");
      navigate("/sign-in", { state: { from: location } });
      return;
    }

    setLoading(true);
    const bookingData = {
      service: service._id,
      branch: values.branch,
      employee: finalEmployeeId,
      date: dayjs(values.date).format("YYYY-MM-DD"), // values.date là dayjs object
      time: dayjs(values.time).format("HH:mm"),   // values.time là dayjs object
      duration: service.duration,
      notes: values.notes || "",
      voucher: selectedVoucher ? selectedVoucher._id : null,
      discount: discount,
      totalAmount: totalPayment,
    };

    try {
      if (selectedVoucher) {
        await redeemVoucher(selectedVoucher.code);
      }

      const response = await bookService(bookingData);
      if (response?.success || response?.data?.success) {
        successToast("Đặt lịch thành công!");
        navigate("/profile", { state: { activeTab: "schedule" } });
      } else {
        const errorMsg = response?.message || response?.data?.message || "Đặt lịch thất bại!";
        errorToast(errorMsg);
        setServerError(errorMsg);
      }
    } catch (err) {
      console.error("Error submitting booking:", err);
      const apiErrorMessage = err.response?.data?.message || "Đặt lịch không thành công do lỗi hệ thống hoặc nhân viên đã có lịch khác.";
      errorToast(apiErrorMessage);
      setServerError(apiErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!service && !loading) {
    return (
      <>
        <Header className="!bg-white !text-black !shadow-md" />
        <div className="flex justify-center items-center h-screen">
          <Text>Không có thông tin dịch vụ để hiển thị.</Text>
        </div>
      </>
    );
  }
  if (!service && loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin tip="Đang tải thông tin dịch vụ..." size="large" />
      </div>
    );
  }

  const selectedEmployeeInfoForAutoDisplay = employeeSelectionMode === 'auto' && autoSelectedEmployeeId && employees.length > 0
    ? employees.find(emp => emp._id === autoSelectedEmployeeId)
    : null;

  const autoSelectedEmployeeNameForDisplay = selectedEmployeeInfoForAutoDisplay
    ? `${selectedEmployeeInfoForAutoDisplay.userInfo?.firstName || ''} ${selectedEmployeeInfoForAutoDisplay.userInfo?.lastName || ''}`.trim() || "Nhân viên được chọn"
    : (employeeLoading && employeeSelectionMode === 'auto' && form.getFieldValue('branch') ? "Đang tìm..." : (employeeSelectionMode === 'auto' && form.getFieldValue('branch') && employees.length === 0 && !employeeLoading ? "Không có nhân viên" : ""));

  return (
    <>
      <Header className="!bg-white !text-black !shadow-md" />
      {/* Tăng max-width để có không gian cho tỷ lệ mới */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Đặt Lịch Dịch Vụ: {service?.name || "Không có tên"}
        </h1>

        {serverError && (
          <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p className="font-bold">Lỗi máy chủ</p>
            <p>{serverError}</p>
          </div>
        )}

        {/* SỬ DỤNG GRID-COLS-5 CHO TỶ LỆ 2/5 VÀ 3/5 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Cột Thông tin dịch vụ - chiếm 2/5 */}
          <div className="lg:col-span-2">
            <Card title="Thông tin dịch vụ" className="h-full shadow-lg">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Tên dịch vụ">
                  {service?.name || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Giá">
                  {(service?.price || 0).toLocaleString("vi-VN")}đ
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian">
                  {service?.duration || "N/A"} phút
                </Descriptions.Item>
                <Descriptions.Item
                  label="Mô tả"
                  className="whitespace-pre-line"
                >
                  {service?.description || "Không có mô tả"}
                </Descriptions.Item>
              </Descriptions>
              <div className="mt-6 border-t pt-4">
                <Row justify="space-between" className="mb-2">
                  <Col>Tạm tính</Col>
                  <Col className="text-right font-medium">
                    {subtotal.toLocaleString("vi-VN")}đ
                  </Col>
                </Row>
                <Row justify="space-between" className="items-center mb-2">
                  <Col>
                    <Button
                      type="link"
                      onClick={showVoucherModal}
                      className="p-0 flex items-center text-blue-600 hover:text-blue-800"
                      disabled={vouchers.length === 0}
                    >
                      <LucideTag className="w-4 h-4 mr-1" />
                      {selectedVoucher
                        ? `Voucher: ${selectedVoucher.code}`
                        : (vouchers.length > 0 ? "Chọn voucher" : "Không có voucher")}
                    </Button>
                  </Col>
                  <Col className="text-right">
                    {discount > 0 ? (
                      <Text className="text-green-600 font-medium">
                        -{discount.toLocaleString("vi-VN")}đ
                      </Text>
                    ) : (
                      <Text className="text-gray-500">Không giảm</Text>
                    )}
                  </Col>
                </Row>
                <Row justify="space-between" className="mt-2 border-t pt-2">
                  <Col>
                    <Text strong className="text-lg">Tổng tiền</Text>
                  </Col>
                  <Col className="text-right">
                    <Text strong className="text-red-600 text-lg">
                      {totalPayment.toLocaleString("vi-VN")}đ
                    </Text>
                  </Col>
                </Row>
              </div>
            </Card>
          </div>

          {/* Cột Thông tin đặt lịch - chiếm 3/5 */}
          <div className="lg:col-span-3">
            <Card title="Thông tin đặt lịch" className="h-full shadow-lg">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  // Sử dụng dayjs cho initialValues của DatePicker và TimePicker
                  date: dayjs(),
                  time: dayjs().hour(9).minute(0),
                }}
              >
                <Form.Item
                  label="Chi nhánh"
                  name="branch"
                  rules={[
                    { required: true, message: "Vui lòng chọn chi nhánh" },
                  ]}
                >
                  <Select
                    placeholder="Chọn chi nhánh"
                    onSelect={handleBranchChange}
                    loading={loading && branches.length === 0}
                    disabled={branches.length === 0 && !loading}
                    allowClear
                  >
                    {branches
                      .filter(
                        (branch) => branch._id !== "680b4f376e58bda8dfa176e2"
                      )
                      .map((branch) => (
                        <Option key={branch._id} value={branch._id}>
                          {branch.BranchName} - {branch.Address}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Chọn nhân viên">
                  <Radio.Group
                    onChange={handleEmployeeSelectionModeChange}
                    value={employeeSelectionMode}
                    disabled={!form.getFieldValue("branch") || employeeLoading || (loading && branches.length === 0)}
                  >
                    <Radio value="manual">Tôi muốn chọn nhân viên</Radio>
                    <Radio value="auto">Hệ thống tự động chọn</Radio>
                  </Radio.Group>
                </Form.Item>

                {employeeSelectionMode === "manual" && (
                  <Form.Item
                    label="Nhân viên"
                    name="employee"
                    rules={[
                      { required: true, message: "Vui lòng chọn nhân viên" },
                    ]}
                  >
                    <Select
                      placeholder={
                        !form.getFieldValue("branch")
                          ? "Vui lòng chọn chi nhánh trước"
                          : (employees.length === 0 && !employeeLoading
                            ? "Không có nhân viên nào tại chi nhánh này"
                            : "Chọn nhân viên")
                      }
                      loading={employeeLoading}
                      disabled={
                        !form.getFieldValue("branch") || (employees.length === 0 && !employeeLoading) || employeeLoading
                      }
                      onChange={(value) => handleEmployeeChange(value, form.getFieldValue("date"))}
                      allowClear
                    >
                      {employees.map((employee) => {
                        const employeeName =
                          employee.userInfo?.firstName
                            ? `${employee.userInfo.firstName} ${employee.userInfo.lastName}`.trim()
                            : "Nhân viên (chưa có tên)";
                        return (
                          <Option key={employee._id} value={employee._id}>
                            {employeeName || `ID: ${employee._id.slice(-6)}`}
                          </Option>
                        );
                      })}
                    </Select>
                    {employees.length === 0 && form.getFieldValue("branch") && !employeeLoading && (
                      <Text type="danger" style={{ display: 'block', marginTop: '4px' }}>
                        Chi nhánh này hiện không có nhân viên nào khả dụng.
                      </Text>
                    )}
                  </Form.Item>
                )}

                {employeeSelectionMode === "auto" && form.getFieldValue("branch") && (
                  <Form.Item label="Nhân viên (Hệ thống chọn)">
                    {employeeLoading ? (
                      <Spin size="small" />
                    ) : autoSelectedEmployeeNameForDisplay ? (
                      <Text strong>
                        {autoSelectedEmployeeNameForDisplay}
                      </Text>
                    ) : (
                      <Text type="secondary">{(employees.length === 0 && !employeeLoading) ? "Không có nhân viên khả dụng" : "Đang chờ hệ thống chọn..."}</Text>
                    )}
                  </Form.Item>
                )}

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Ngày hẹn"
                      name="date"
                      rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                    >
                      <DatePicker
                        format="DD/MM/YYYY" // Format hiển thị
                        style={{ width: "100%" }}
                        disabledDate={(current) =>
                          current && current < dayjs().startOf("day") // current là dayjs object
                        }
                        onChange={handleDateChange} // nhận dayjs object
                        allowClear={false}
                        onOpenChange={handleOpenChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Giờ hẹn"
                      name="time"
                      rules={[{ required: true, message: "Vui lòng chọn giờ" }]}
                    >
                      <TimePicker
                        format="HH:mm" // Format hiển thị
                        minuteStep={30}
                        style={{ width: "100%" }}
                        disabledTime={disabledTime}
                        hideDisabledOptions
                        allowClear={false}
                      // onChange={(time) => form.setFieldsValue({ time })} // AntD Form tự xử lý
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="Ghi chú (tuỳ chọn)" name="notes">
                  <textarea
                    className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    rows={3}
                    placeholder="Nhập ghi chú cho buổi hẹn (ví dụ: yêu cầu đặc biệt,...)"
                  />
                </Form.Item>

                <div className="flex justify-center mt-8">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading || checkingAvailability}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md w-full md:w-auto"
                    disabled={
                      !form.getFieldValue("branch") ||
                      (employeeSelectionMode === 'manual' && !form.getFieldValue("employee") && employees.length > 0 && !employeeLoading) ||
                      (employeeSelectionMode === 'auto' && !autoSelectedEmployeeId && employees.length > 0 && form.getFieldValue("branch") && !employeeLoading) ||
                      (employees.length === 0 && form.getFieldValue("branch") && !employeeLoading) ||
                      checkingAvailability
                    }
                  >
                    Xác Nhận Đặt Lịch
                  </Button>
                </div>
              </Form>
            </Card>
          </div>
        </div>

        <Modal
          title="Chọn voucher ưu đãi"
          open={isVoucherModalVisible} // AntD v5+ sử dụng 'open'
          onCancel={handleVoucherCancel}
          footer={null}
          width={600}
          destroyOnClose
        >
          {vouchers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto p-1">
              {vouchers.map((voucher) => (
                <div
                  key={voucher._id}
                  className={`border rounded-lg p-4 shadow-sm transition-all ${selectedVoucher?._id === voucher._id
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                    : "border-gray-200 hover:shadow-md"
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-md font-semibold text-blue-700">{voucher.title} ({voucher.code})</h3>
                    <div>
                      {voucher.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`text-xs px-2 py-1 rounded-full ml-1 ${tag === "Hết hạn"
                            ? "bg-red-100 text-red-700"
                            : (tag === "Dịch vụ" ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700")
                            }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">Giảm: <span className="font-medium">{`${voucher.discount}%`}</span>
                    {voucher.maximumDiscount > 0 && ` (tối đa ${voucher.maximumDiscount.toLocaleString('vi-VN')}đ)`}
                  </p>
                  {voucher.minOrder && (
                    <p className="text-sm text-gray-600">{voucher.minOrder}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{voucher.expiry}</p>
                  <Button
                    type="primary"
                    ghost={selectedVoucher?._id === voucher.id} // Sửa thành selectedVoucher?._id
                    className="mt-3 w-full"
                    onClick={() => applyVoucher(voucher)}
                    disabled={voucher.tags.includes("Hết hạn")}
                  >
                    {selectedVoucher?._id === voucher._id ? "Đã chọn" : "Áp dụng"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8"> {/* Bỏ col-span-2 vì chỉ có 1 phần tử con */}
              <LucideTag className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Bạn chưa có voucher nào hợp lệ cho dịch vụ.</p>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default BookServicePage;