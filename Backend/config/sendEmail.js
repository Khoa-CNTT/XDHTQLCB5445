// utils/sendMail.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOrderPaidEmail = async (order) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: order.shippingAddress?.email || 'default@example.com',
        subject: 'Đơn hàng của bạn đã được thanh toán thành công!',
        html: `
      <h3>Đơn hàng #${order.orderCode}</h3>
      <p>Tổng tiền: ${order.totalAmount.toLocaleString()}₫</p>
      <p>Trạng thái: Thanh toán thành công!</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Lỗi gửi mail:', err);
    }
};

export default { sendOrderPaidEmail };