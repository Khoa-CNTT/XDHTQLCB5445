import React from 'react';
import { Button } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const ExportExcel = ({ 
  reportType, 
  dateRange, 
  reportData, 
  topProducts, 
  topServices, 
  staffPerformance, 
  revenuePieData
}) => {
  
  const formatDate = (date) => {
    return date ? date.format('DD/MM/YYYY') : '';
  };
  
  const handleExport = () => {
    try {
      // Tạo workbook mới
      const wb = XLSX.utils.book_new();
      
      const generalInfo = [
        ['Báo cáo', getReportTypeName(reportType)],
        ['Từ ngày', formatDate(dateRange?.[0])],
        ['Đến ngày', formatDate(dateRange?.[1])],
        ['Thời gian xuất báo cáo', new Date().toLocaleString('vi-VN')],
        [''],
        ['Tổng số lượng', reportData.quantity],
        ['Tổng doanh thu', `${reportData.revenue.toLocaleString()} ₫`],
      ];
      
      const generalSheet = XLSX.utils.aoa_to_sheet(generalInfo);
      XLSX.utils.book_append_sheet(wb, generalSheet, 'Thông tin chung');
      
      // Tạo sheet dựa trên loại báo cáo
      switch(reportType) {
        case 'order':
          if(topProducts.length > 0) {
            const productsData = [
              ['ID', 'Tên sản phẩm', 'Số lượng đã bán']
            ];
            
            topProducts.forEach(product => {
              productsData.push([
                product.productId,
                product.name,
                product.quantity
              ]);
            });
            
            const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
            XLSX.utils.book_append_sheet(wb, productsSheet, 'Sản phẩm bán chạy');
          }
          
          if(revenuePieData.length > 0) {
            const revenueData = [
              ['Ngày', 'Doanh thu (₫)']
            ];
            
            revenuePieData.forEach(item => {
              revenueData.push([
                item.name,
                item.value
              ]);
            });
            
            const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
            XLSX.utils.book_append_sheet(wb, revenueSheet, 'Doanh thu theo ngày');
          }
          break;
        
        case 'booking':
          if(topServices.length > 0) {
            const servicesData = [
              ['ID', 'Tên dịch vụ', 'Số lượt đặt', 'Giá (₫)', 'Thời gian (phút)', 'Danh mục']
            ];
            
            topServices.forEach(service => {
              servicesData.push([
                service.id,
                service.name,
                service.count,
                service.price,
                service.duration,
                service.category
              ]);
            });
            
            const servicesSheet = XLSX.utils.aoa_to_sheet(servicesData);
            XLSX.utils.book_append_sheet(wb, servicesSheet, 'Dịch vụ phổ biến');
          }
          break;
        
        case 'staff':
          if(staffPerformance.length > 0) {
            const staffData = [
              ['Tên nhân viên', 'Vị trí', 'Tổng lịch hẹn', 'Hoàn thành', 'Đã hủy', 'Tỷ lệ hoàn thành (%)', 'Đánh giá TB', 'Doanh thu (₫)']
            ];
            
            staffPerformance.forEach(staff => {
              staffData.push([
                staff.name,
                staff.position,
                staff.totalBookings,
                staff.completedBookings,
                staff.cancelledBookings,
                staff.completionRate,
                staff.averageRating > 0 ? staff.averageRating.toFixed(1) : 'Chưa có',
                staff.totalRevenue
              ]);
            });
            
            const staffSheet = XLSX.utils.aoa_to_sheet(staffData);
            XLSX.utils.book_append_sheet(wb, staffSheet, 'Hiệu suất nhân viên');
          }
          break;
          
        default:
          break;
      }
      
      // Xuất file Excel
      const fileName = `bao-cao-${reportType}-${formatDate(dateRange?.[0])}-${formatDate(dateRange?.[1])}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo Excel:', error);
      alert('Có lỗi xảy ra khi xuất báo cáo Excel');
    }
  };
  
  const getReportTypeName = (type) => {
    switch(type) {
      case 'order': return 'Đơn hàng';
      case 'booking': return 'Lịch hẹn';
      case 'staff': return 'Nhân viên';
      default: return '';
    }
  };
  
  const isDataAvailable = () => {
    return reportData && (reportData.quantity > 0 || reportData.revenue > 0);
  };
  
  return (
    <Button 
      icon={<FileExcelOutlined />}
      type="primary" 
      style={{ background: '#52c41a', borderColor: '#52c41a' }}
      onClick={handleExport}
      disabled={!isDataAvailable()}
    >
      Xuất Excel
    </Button>
  );
};

export default ExportExcel;