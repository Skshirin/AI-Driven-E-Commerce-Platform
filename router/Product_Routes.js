import express from "express";
import { createProduct, fetchAllProducts} from "../controllers/productController.js";
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


export default router;