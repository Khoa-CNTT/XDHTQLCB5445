import React, { useEffect, useState } from 'react'
import mess from '../img/mess.png'
import phone from '../img/phone.webp.png'
import { Tooltip } from 'antd'

const Mess = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timeout)
  }, [])
  const handleClick = () => {
    window.open('https://www.facebook.com/profile.php?id=61569283482578', '_blank')
  }
  const handleClickPhone = () => {
    window.open('tel:123456789', '_blank')
  }
  return (
    <div className="fixed bottom-[70px] right-1 z-30 pointer-events-none">
      <div
        className={`rounded-lg p-4 flex flex-col items-center pointer-events-auto space-y-4 ${
          isVisible ? 'mess-animation' : 'opacity-0'
        }`}
      >
      <Tooltip
          placement="leftTop"
          title="Hãy nhắn tin cho chúng tôi qua Fanpage"
          arrow={true}>
        <img
          onClick={handleClick}
          onMouseEnter={() => setIsVisible(true)}
          src={mess}
          alt="mess"
          className="w-[45px] h-[45px] cursor-pointer shake-loopm "
        />
        </Tooltip>
       <Tooltip
          placement="leftTop"
          title="Liên hệ với chúng tôi qua Hotline"
          arrow={true}>
       <img
          onClick={handleClickPhone}
          onMouseEnter={() => setIsVisible(true)}
          src={phone}
          alt="phone"
          className="w-[45px] h-[45px] text- cursor-pointer shake-loopp"
        />
       </Tooltip>
      </div>
    </div>
  )
}

export default Mess
