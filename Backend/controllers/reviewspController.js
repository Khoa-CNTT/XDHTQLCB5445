import ReviewSP from '../models/reviewspModel.js';

const addReviewSP = async (req, res) => {
<<<<<<< HEAD
    const { productId, userId, rating, comment } = req.body;

    if (!productId || !userId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
      const newReview = new ReviewSP({ productId, userId, rating, comment });
      await newReview.save();
      res.status(201).json({ success: true, message: 'Review added successfully', review: newReview });
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ success: false, message: 'Failed to add review' });
    }
};

const getReviewsByProduct = async (req, res) => {
    const { productId } = req.params;

    try {
      const reviews = await ReviewSP.find({ productId }).sort({ createdAt: -1 });
      res.json({ success: true, reviews });
=======
  const { productId, userId, rating, comment } = req.body;

  try {
    const newReview = new ReviewSP({ productId, userId, rating, comment });
    await newReview.save();
    res.status(201).json({ success: true, message: 'Review added successfully', review: newReview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add review' });
  }
};


const getReviewsByProduct = async (req, res) => {
    const { productId } = req.params;
    try {
      const reviews = await ReviewSP.find({ productId }).sort({ createdAt: -1 });
      res.json({ success: true, data:reviews });
>>>>>>> c1949cc (Bao cao lan 3)
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
};

const removeReviewSP = async (req, res) => {
<<<<<<< HEAD
    const { id } = req.params;

    try {
      await ReviewSP.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: 'Review removed successfully' });
    } catch (error) {
      console.error('Error removing review:', error);
      res.status(500).json({ success: false, message: 'Failed to remove review' });
    }
=======
  const { id } = req.params;

  try {
    const review = await ReviewSP.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
    }
    await ReviewSP.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Xóa đánh giá thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa đánh giá:', error);
    res.status(500).json({ success: false, message: 'Xóa đánh giá thất bại' });
  }
>>>>>>> c1949cc (Bao cao lan 3)
};

export { addReviewSP, getReviewsByProduct, removeReviewSP };
