import React from 'react'
import ProductDetail from '../components/ProductDetail'
import Footer from '../components/Footer'
import Header from '../components/Header'
import ReviewsInDeTailSP from '../components/ReviewsDetailSP'

const ProductDetailPage = () => {
  return (
    <div className=''>
    <Header className="!bg-white !text-black !shadow-md" />
      <div className='p-10 pt-6'>
        <ProductDetail />
        <ReviewsInDeTailSP />
      </div>
      <Footer />
      
    </div>
  )
}

export default ProductDetailPage