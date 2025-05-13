import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StripeCheckout = () => {
  const navigate = useNavigate();
  const handleBackToHome = () => {
    navigate('/');
  }
  const handleOrderTab = () => {
    navigate('/profile', { state: { tab: 'orders' } });
  }
  return (
    <div className="flex items-center justify-center ">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
          <CheckCircle  className="text-green-500 w-12 h-12" />
        </div>
        <div className="text-black text-xl font-semibold mt-4">Thanh toán thành công</div>
        <div className="text-black text-lg mt-2">Cảm ơn bạn đã đặt hàng!</div>
        <div className="text-black text-lg mt-2">Chúng tôi đã nhận được thanh toán của bạn.</div>
        <button onClick={handleOrderTab}>Hãy bấm vào tôi để xem đơn hàng của bạn</button>
        <button className='bg-blue-400 mt-3 p-3' onClick={handleBackToHome}>Trở lại trang chủ</button>
      </div>
    </div>
  );
};

export default StripeCheckout;
