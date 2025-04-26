import express from 'express';
import { addReviewSP, getReviewsByProduct, removeReviewSP } from '../controllers/reviewspController.js';

const reviewRouter = express.Router();

<<<<<<< HEAD
reviewRouter.post('/add', addReviewSP);
reviewRouter.get('/:productId', getReviewsByProduct);
reviewRouter.delete('/:id', removeReviewSP);
=======
reviewRouter.post('/add',addReviewSP);
reviewRouter.get('/:productId', getReviewsByProduct);
reviewRouter.delete('/remove/:id', removeReviewSP);
>>>>>>> c1949cc (Bao cao lan 3)

export default reviewRouter;
