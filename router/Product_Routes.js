import express from "express";
import { createProduct, fetchAllProducts, updateProduct, deleteProduct, fetchSingleProduct, postProductReview, deleteReview} from "../controllers/productController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { authorizedRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
    "/admin/create",
     isAuthenticated,
     authorizedRoles("admin"),
     createProduct
    );

router.get("/", fetchAllProducts); 

router.put(
    "/admin/update/:productId",
    isAuthenticated,
    authorizedRoles("admin"),
    updateProduct
);

router.delete(
    "/admin/delete/:productId",
    isAuthenticated,
    authorizedRoles("admin"),
    deleteProduct
);

router.get("/singleProduct/:productId", fetchSingleProduct);

router.get("/postProductReview/:productId", isAuthenticated, fetchSingleProduct);

router.put("/post-new/review/:productId", isAuthenticated, postProductReview);

router.delete("/delete/review/:productId", isAuthenticated, deleteReview);

export default router;