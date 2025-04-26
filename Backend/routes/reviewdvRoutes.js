import express from 'express';
import { addReviewSV, getReviewsByService, removeReviewSV } from '../controllers/reviewdvController.js';

const reviewRouter = express.Router();
reviewRouter.post('/add', addReviewSV);
reviewRouter.get('/:serviceId', getReviewsByService);
<<<<<<< HEAD
reviewRouter.delete('/:id', removeReviewSV);
=======
reviewRouter.delete('/remove/:id', removeReviewSV);
>>>>>>> c1949cc (Bao cao lan 3)

export default reviewRouter;
