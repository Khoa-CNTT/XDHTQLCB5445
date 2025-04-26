import crypto from 'crypto';
import moment from 'moment';
import qs from 'qs';
import dotenv from 'dotenv';

dotenv.config();

const tmnCode = process.env.VNPAY_TMN_CODE;
const secretKey = process.env.VNPAY_HASH_SECRET;
const vnpUrl = process.env.VNPAY_URL;
const returnUrl = process.env.VNPAY_RETURN_URL;
const ipnUrl = process.env.VNPAY_IPN_URL; // Thêm IPN URL

// Hàm sắp xếp object theo key
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// Hàm tạo URL thanh toán VNPay
export function createVNPayPaymentURL(req, orderId, amount, orderInfo = 'Thanh toan don hang', orderType = 'other', locale = 'vn') {
    const createDate = moment().format('YYYYMMDDHHmmss');
    const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // VNPay yêu cầu amount là số nguyên (nhân 100)
    const vnpAmount = amount * 100;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId.toString() + '_' + createDate; // Mã tham chiếu giao dịch unique
    vnp_Params['vnp_OrderInfo'] = orderInfo + ' ' + orderId;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = vnpAmount;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    // vnp_Params['vnp_ExpireDate'] = expireDate; // Có thể thêm ngày hết hạn thanh toán

    vnp_Params['vnp_BankCode'] = ''; // Để trống để hiển thị cổng chọn ngân hàng

    // Sắp xếp params và tạo query string
    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });

    // Tạo chữ ký
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;

    // Tạo URL cuối cùng
    const finalUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });

    return finalUrl;
}

// Hàm xác thực chữ ký VNPay trả về (cho cả Return URL và IPN)
export function verifyVNPaySignature(vnp_Params) {
    const secureHash = vnp_Params['vnp_SecureHash'];
    // Xóa hash khỏi object để tạo lại hashData
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType']; // Xóa nếu có

    // Sắp xếp lại và tạo query string
    const sortedParams = sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });

    // Tạo chữ ký mới
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    console.log("Received Hash:", secureHash);
    console.log("Generated Hash:", signed);

    return secureHash === signed;
}