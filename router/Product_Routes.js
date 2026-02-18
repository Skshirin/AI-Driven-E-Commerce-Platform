import express from "express";
import { createProduct, fetchAllProducts, updateProduct, deleteProduct, fetchSingleProduct, postProductReview} from "../controllers/productController.js";
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

export default router;