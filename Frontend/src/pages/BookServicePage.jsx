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
} from "antd";
import moment from "moment";
import { listBranch } from "../APIs/brand";
import { listEmployee, getEmployeeBookings } from "../APIs/employee";
import { bookService } from "../APIs/booking";
import { errorToast, successToast, toastContainer } from "../utils/toast";
import axios from "axios";
import { Tag } from "lucide-react";
import { redeemVoucher } from "../APIs/VoucherAPI";
import Header from "../components/Header";
const { Option } = Select;
const { Text } = Typography;
// const API_BASE_URL = "https://backend-fu3h.onrender.com/api/";
const API_BASE_URL = "http://localhost:4000/api/";
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
  const [loading, setLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [service, setService] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [employeeBookings, setEmployeeBookings] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isVoucherModalVisible, setIsVoucherModalVisible] = useState(false);
  const now = new Date();
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
      errorToast("Không thể tải danh sách chi nhánh");
    } finally {
      setLoading(false);
    }
  };
  const fetchEmployeesByBranch = async (branchId) => {
    if (!branchId) {
      setEmployees([]);
      return;
    }

    try {
      setEmployeeLoading(true);
      const response = await listEmployee();

      if (!Array.isArray(response.data)) {
        errorToast("Dữ liệu nhân viên không đúng định dạng");
        setEmployees([]);
        return;
      }

      const normalizedEmployees = response.data.map((emp) => {
        const status = emp.Status;
        const branchInfo = emp.BranchID;
        const userInfo = emp.User;

        return {
          ...emp,
          branchInfo,
          userInfo,
          status,
        };
      });

      const filteredEmployees = normalizedEmployees.filter((emp) => {
        const empBranchId =
          (typeof emp.branchInfo === "object"
            ? emp.branchInfo?._id
            : emp.branchInfo) ||
          emp.BranchID?._id ||
          emp.BranchID;

        return (
          empBranchId === branchId &&
          emp.status?.trim().toLowerCase() !== "nghỉ việc"
        );
      });

      setEmployees(filteredEmployees);
    } catch (error) {
      errorToast("Không thể tải danh sách nhân viên");
    } finally {
      setEmployeeLoading(false);
    }
  };
  const fetchEmployeeBookings = async (employeeId, date) => {
    if (!employeeId || !date) return;

    try {
      const response = await getEmployeeBookings(
        employeeId,
        date.format("YYYY-MM-DD")
      );
      if (Array.isArray(response.data)) {
        setEmployeeBookings(response.data);
        console.log("Employee bookings:", response.data);
      } else {
        setEmployeeBookings([]);
      }
    } catch (error) {
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
          title: `Ưu đãi ${
            voucher.applicableTo === "services" ? "dịch vụ" : "tất cả"
          }`,
          discount: Number(voucher.discount) || 0,
          expiry: `HSD: ${new Date(voucher.endDate).toLocaleDateString(
            "vi-VN"
          )}`,
          tags: [
            voucher.applicableTo === "services" ? "Dịch vụ" : "Tất cả",
            new Date() > new Date(voucher.endDate) ? "Hết hạn" : "Còn hiệu lực",
          ],
          minOrder:
            voucher.minimumAmount > 0
              ? `Đơn hàng từ ${voucher.minimumAmount.toLocaleString()} đ`
              : null,
        }));
      setVouchers(formattedVouchers);
    } catch (error) {
      errorToast("Lỗi khi lấy danh sách voucher");
    }
  };
  const handleBranchChange = (branchId) => {
    form.setFieldsValue({ employee: undefined });
    if (branchId) {
      fetchEmployeesByBranch(branchId);
    } else {
      setEmployees([]);
    }
  };
  useEffect(() => {
    const currentBranch = form.getFieldValue("branch");
    if (currentBranch && employees.length > 0) {
      const randomEmp = employees[Math.floor(Math.random() * employees.length)];
      form.setFieldsValue({ employee: randomEmp._id });
      handleEmployeeChange(randomEmp._id);
    }
  }, [employees]);
  const handleEmployeeChange = (employeeId) => {
    const date = form.getFieldValue("date");
    if (employeeId && date) {
      fetchEmployeeBookings(employeeId, date);
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

  const handleDateChange = (date) => {
    const employeeId = form.getFieldValue("employee");
    if (employeeId && date) {
      fetchEmployeeBookings(employeeId, date);
    }
  };
  const disabledTime = () => {
    const allowedHours = Array.from({ length: 11 }, (_, i) => i + 8); 
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    const disabledHours = allHours.filter((h) => !allowedHours.includes(h));
    return {
      disabledHours: () => disabledHours,
      disabledMinutes: (hour) => {
        return hour >= 8 && hour <= 18 ? [] : [0, 30];
      },
    };
  };

  const isTimeSlotAvailable = (employeeId, date, time, duration) => {
    if (!employeeId || !date || !time || !duration) return true;

    const selectedDate = date.format("YYYY-MM-DD");
    const selectedTime = time.format("HH:mm");
    const selectedStart = convertTimeToMinutes(selectedTime);
    const selectedEnd = selectedStart + duration;

    const dayBookings = employeeBookings.filter(
      (booking) => booking.date === selectedDate
    );

    for (const booking of dayBookings) {
      const bookingStart = convertTimeToMinutes(booking.time);
      const bookingEnd = bookingStart + (booking.duration || service.duration);
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
    const currentDate = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);

    if (currentDate < startDate || currentDate > endDate) {
      errorToast("Voucher không còn hiệu lực");
      return;
    }

    if (voucher.usageLeft >= voucher.usageLimit) {
      errorToast("Voucher đã hết lượt sử dụng");
      return;
    }

    if (service.price < (voucher.minimumAmount || 0)) {
      errorToast(
        `Dịch vụ phải có giá trị tối thiểu ${(
          voucher.minimumAmount || 0
        ).toLocaleString("vi-VN")} ₫`
      );
      return;
    }

    setSelectedVoucher(voucher);
    successToast(`Áp dụng voucher ${voucher.code} thành công!`);
    setIsVoucherModalVisible(false);
  };
  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;

    let discountPercent = Number(selectedVoucher.discount) || 0;
    let maxDiscount = Number(selectedVoucher.maximumDiscount) || Infinity;

    let discountAmount = service.price * (discountPercent / 100);

    discountAmount = Math.min(discountAmount, maxDiscount);

    return discountAmount;
  };
  const subtotal = service ? service.price : 0;
  const discount = calculateDiscount();
  const totalPayment = subtotal - discount;
  const checkAvailabilityBeforeSubmit = async () => {
    const values = await form.validateFields();
    if (!service || !service._id || !service.duration) {
      errorToast("Thiếu thông tin dịch vụ");
      return false;
    }
    if (now.getHours() > values.time.hours()) {
      errorToast("Giờ đặt lịch đã qua!");
      return false;
    }
    const { branch, employee, date, time } = values;

    if (!branch || !employee || !date || !time) {
      errorToast("Vui lòng điền đầy đủ thông tin đặt lịch");
      return false;
    }

    setCheckingAvailability(true);

    try {
      const isAvailable = isTimeSlotAvailable(
        employee,
        date,
        time,
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
      errorToast("Có lỗi khi kiểm tra khung giờ");
      return false;
    } finally {
      setCheckingAvailability(false);
    }
  };
  const onFinish = async (values) => {
    setServerError(null);

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
      employee: values.employee,
      date: values.date.format("YYYY-MM-DD"),
      time: values.time.format("HH:mm"),
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
      if (response?.success) {
        successToast("Đặt lịch thành công!");
        navigate("/profile", { state: { activeTab: "schedule" } });
      } else {
        const errorMsg = response?.message || "Đặt lịch thất bại!";
        errorToast(errorMsg);
        setServerError(errorMsg);
      }
    } catch (err) {
      errorToast("Nhân viên này đã được đặt!");
    } finally {
      setLoading(false);
    }
  };

  if (!service) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin tip="Đang tải..." size="large" />
      </div>
    );
  }
  return (
    <>
      <Header className="!bg-white !text-black !shadow-md" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {toastContainer()}
        <h1 className="text-2xl font-bold mb-6 text-center">
          Đặt Lịch Dịch Vụ: {service.name}
        </h1>

        {serverError && (
          <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Lỗi máy chủ</p>
            <p>{serverError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card title="Thông tin dịch vụ" className="h-full">
              <Descriptions column={1}>
                <Descriptions.Item label="Tên dịch vụ">
                  {service.name}
                </Descriptions.Item>
                <Descriptions.Item label="Giá">
                  {service.price.toLocaleString("vi-VN")}đ
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian">
                  {service.duration} phút
                </Descriptions.Item>
                <Descriptions.Item
                  label="Mô tả"
                  className="whitespace-pre-line"
                >
                  {service.description || "Không có mô tả"}
                </Descriptions.Item>
              </Descriptions>
              <div className="mt-4">
                <Row justify="space-between">
                  <Col span={12}>Tạm tính</Col>
                  <Col span={12} className="text-right">
                    {subtotal.toLocaleString("vi-VN")}đ
                  </Col>
                </Row>
                <Row justify="space-between" className="items-center">
                  <Col span={12}>
                    <Button
                      type="link"
                      onClick={showVoucherModal}
                      className="p-0 flex items-center"
                    >
                      <Tag className="w-4 h-4 mr-1" />
                      {selectedVoucher
                        ? `Voucher: ${selectedVoucher.code}`
                        : "Chọn voucher"}
                    </Button>
                  </Col>
                  <Col span={12} className="text-right">
                    {discount > 0 ? (
                      <Text className="text-green-500">
                        -{discount.toLocaleString("vi-VN")}đ
                      </Text>
                    ) : (
                      <Text className="text-red-500">Không có</Text>
                    )}
                  </Col>
                </Row>
                <Row justify="space-between">
                  <Col span={12}>
                    <Text strong>Tổng tiền</Text>
                  </Col>
                  <Col span={12} className="text-right">
                    <Text strong className="text-red-500">
                      {totalPayment.toLocaleString("vi-VN")}đ
                    </Text>
                  </Col>
                </Row>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Thông tin đặt lịch" className="h-full">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  date: moment(),
                  time: moment().hour(9).minute(0),
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
                    loading={loading}
                  >
                    {branches
                    .filter((branch) => branch._id !== "680b4f376e58bda8dfa176e2")
                    .map((branch) => (
                      <Option key={branch._id} value={branch._id}>
                        {branch.BranchName} - {branch.Address}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Nhân viên"
                  name="employee"
                  rules={[
                    { required: true, message: "Vui lòng chọn nhân viên" },
                  ]}
                >
                  <Select
                    placeholder={
                      employees.length === 0
                        ? "Không có nhân viên nào"
                        : "Chọn nhân viên"
                    }
                    loading={employeeLoading}
                    disabled={
                      !form.getFieldValue("branch") || employees.length === 0
                    }
                    onChange={handleEmployeeChange}
                  >
                    {employees.map((employee) => {
                      const employeeName =
                        employee.userInfo?.firstName ||
                        employee.user?.name ||
                        employee.User?.name ||
                        "Nhân viên";
                      return (
                        <Option key={employee._id} value={employee._id}>
                          {employeeName}
                        </Option>
                      );
                    })}
                  </Select>
                  {employees.length === 0 && form.getFieldValue("branch") && (
                    <p className="text-red-500 text-sm mt-1">
                      Chi nhánh này hiện không có nhân viên nào khả dụng
                    </p>
                  )}
                </Form.Item>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    label="Ngày hẹn"
                    name="date"
                    rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      disabledDate={(current) =>
                        current && current < moment().startOf("day")
                      }
                      onChange={handleDateChange}
                      onOk={(value) => form.setFieldsValue({ date: value })}
                      allowClear={false}
                      onOpenChange={handleOpenChange}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Giờ hẹn"
                    name="time"
                    rules={[{ required: true, message: "Vui lòng chọn giờ" }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      minuteStep={30}
                      allowClear={false}
                      hideDisabledOptions
                      style={{ width: "100%" }}
                      disabledTime={disabledTime}
                    />
                  </Form.Item>
                </div>
                <Form.Item label="Ghi chú" name="notes">
                  <textarea
                    className="w-full border rounded p-2"
                    rows={3}
                    placeholder="Nhập ghi chú (nếu có)"
                  />
                </Form.Item>

                <div className="flex justify-center mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading || checkingAvailability}
                    className="bg-blue-400  w-full md:w-auto"
                    disabled={
                      employees.length === 0 ||
                      !employees.some(
                        (emp) => emp.canBeBooked !== "Nghỉ việc"
                      ) ||
                      !form.getFieldValue("branch")
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
          title="Chọn voucher"
          visible={isVoucherModalVisible}
          onCancel={handleVoucherCancel}
          footer={null}
          width={800}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vouchers.map((voucher) => (
              <div
                key={voucher._id}
                className={`border rounded-lg p-4 ${
                  selectedVoucher?._id === voucher._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    {voucher.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`text-xs px-2 py-1 rounded-full ${
                          tag === "Hết hạn"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold">{voucher.title}</h3>
                  <p className="text-sm text-gray-600">{`${voucher.discount}%`}</p>
                  {voucher.minOrder && (
                    <p className="text-sm text-gray-600">{voucher.minOrder}</p>
                  )}
                  <p className="text-sm text-gray-500">{voucher.expiry}</p>
                  <Button
                    type="primary"
                    className="mt-4 w-full"
                    onClick={() => applyVoucher(voucher)}
                    disabled={voucher.tags.includes("Hết hạn")}
                  >
                    Áp dụng
                  </Button>
                </div>
              </div>
            ))}
            {vouchers.length === 0 && (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">Bạn chưa lưu voucher nào</p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </>
  );
};

export default BookServicePage;
