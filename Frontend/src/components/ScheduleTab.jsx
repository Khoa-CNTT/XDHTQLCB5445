import React, { useState } from 'react';
import { DatePicker, Select, List, Tag } from 'antd';
import moment from 'moment';

const ScheduleTab = () => {
    const { Option } = Select;
    const dummyScheduleData = [
        {
            id: 1,
            date: '2024-11-20',
            startTime: '09:00',
            endTime: '17:00',
            serviceType: 'Massage',
            customerName: 'Alice Smith',
            status: 'confirmed',
        },
        {
            id: 2,
            date: '2024-11-20',
            startTime: '14:00',
            endTime: '15:00',
            serviceType: 'Facial',
            customerName: 'Bob Johnson',
            status: 'pending',
        },
        {
            id: 3,
            date: '2024-11-21',
            startTime: '10:00',
            endTime: '18:00',
            serviceType: 'Waxing',
            customerName: 'Charlie Brown',
            status: 'completed',
        },
    ];
    const [selectedDate, setSelectedDate] = useState(moment());
    const [scheduleData, setScheduleData] = useState(dummyScheduleData); // Replace with your data source

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleFilterChange = (value) => {
        // Implement filtering logic here based on the selected value
        console.log(`Selected filter: ${value}`);
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'confirmed':
                return <Tag color="green">Đã Xác Nhận</Tag>;
            case 'pending':
                return <Tag color="warning">Đang Chờ</Tag>;
            case 'completed':
                return <Tag color="success">Hoàn Thành</Tag>;
            case 'cancelled':
                return <Tag color="error">Đã Hủy</Tag>;
            default:
                return <Tag>Không Xác Định</Tag>;
        }
    };

    const filteredSchedule = scheduleData.filter(item => moment(item.date).isSame(selectedDate, 'day'));

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Lịch Hẹn Nhân Viên - Quân Nguyễn</h2>

            <div className="flex gap-2 mb-5 items-center">
                <DatePicker defaultValue={moment()} onChange={handleDateChange} className="shadow-sm rounded-md" />
                <Select defaultValue="all" style={{ width: 150 }} onChange={handleFilterChange} className="shadow-sm rounded-md">
                    <Option value="all">Tất Cả Dịch Vụ</Option>
                    <Option value="massage">Massage</Option>
                    <Option value="facial">Facial</Option>
                    <Option value="waxing">Waxing</Option>
                </Select>
            </div>

            <List
                className="mt-4"
                bordered
                dataSource={filteredSchedule}
                renderItem={item => (
                    <List.Item>
                        <div className="flex justify-between items-center w-full">
                            <div className="flex-grow">
                                <p><strong className="font-medium">Thời Gian:</strong> {item.startTime} - {item.endTime}</p>
                                <p><strong className="font-medium">Dịch Vụ:</strong> {item.serviceType}</p>
                                {item.customerName && <p><strong className="font-medium">Khách Hàng:</strong> {item.customerName}</p>}
                            </div>
                            <div className="ml-5">
                                {getStatusTag(item.status)}
                            </div>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default ScheduleTab;