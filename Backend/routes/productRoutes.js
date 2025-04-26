import express from "express";
<<<<<<< HEAD
import { addProduct, listProduct, removeProduct, updateProduct } from "../controllers/productController.js"; 
=======
import { addProduct, getProductById, listProduct, removeProduct, updateProduct } from "../controllers/productController.js"; 
>>>>>>> c1949cc (Bao cao lan 3)
import multer from "multer";

const productRouter = express.Router();

const storage =multer.diskStorage({ //dis.. tai file len diskStorage()luu tr va dat ten
    destination:'uploads',
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}${file.originalname}`) // ko baoloi-
    }
})
const upload=multer({storage:storage})
productRouter.post("/add", upload.single("ImagePD"), addProduct);
productRouter.put("/update", updateProduct);
productRouter.get('/list', listProduct); 
productRouter.post("/remove", removeProduct);
<<<<<<< HEAD
=======
productRouter.get('/:id', getProductById); 
>>>>>>> c1949cc (Bao cao lan 3)


export default productRouter;
