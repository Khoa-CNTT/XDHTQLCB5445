import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  maximumDiscount: {
    type: Number,
  },
  minimumAmount: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    required: true,
  },
  usageLeft: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true, // Mặc định là hoạt động
    index: true, // Index để tìm kiếm nhanh hơn
  },
  applicableTo: {
    type: String,
    enum: ['all', 'products', 'services'],
    default: 'all',
  },
});

const Voucher = mongoose.model('Voucher', voucherSchema);

export default Voucher;
