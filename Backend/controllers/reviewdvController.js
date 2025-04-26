import ReviewSV from '../models/reviewdvModel.js';

const addReviewSV = async (req, res) => {
    const { serviceId, userId, rating, comment } = req.body;
<<<<<<< HEAD

    if (!serviceId || !userId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

=======
>>>>>>> c1949cc (Bao cao lan 3)
    try {
      const newReview = new ReviewSV({ serviceId, userId, rating, comment });
      await newReview.save();
      res.status(201).json({ success: true, message: 'Review added successfully', review: newReview });
    } catch (error) {
<<<<<<< HEAD
      console.error('Error adding review:', error);
=======
>>>>>>> c1949cc (Bao cao lan 3)
      res.status(500).json({ success: false, message: 'Failed to add review' });
    }
};

const getReviewsByService = async (req, res) => {
    const { serviceId } = req.params;

    try {
      const reviews = await ReviewSV.find({ serviceId }).sort({ createdAt: -1 });
<<<<<<< HEAD
      res.json({ success: true, reviews });
=======
      res.json({ success: true,data: reviews });
>>>>>>> c1949cc (Bao cao lan 3)
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
};

const removeReviewSV = async (req, res) => {
<<<<<<< HEAD
    const { id } = req.params;

    try {
      await ReviewSV.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: 'Review removed successfully' });
    } catch (error) {
      console.error('Error removing review:', error);
      res.status(500).json({ success: false, message: 'Failed to remove review' });
    }
=======
  const { id } = req.params;
  const currentUserId = req.user.id;

  try {
    const review = await ReviewSV.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (review.userId.toString() !== currentUserId) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xoá đánh giá này" });
    }

    await ReviewSV.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Review removed successfully" });
  } catch (error) {
    console.error("Error removing review:", error);
    res.status(500).json({ success: false, message: "Failed to remove review" });
  }
>>>>>>> c1949cc (Bao cao lan 3)
};

export { addReviewSV, getReviewsByService, removeReviewSV };
