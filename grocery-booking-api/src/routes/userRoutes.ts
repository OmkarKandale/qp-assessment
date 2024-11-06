import { Router } from "express";
import { authMiddleware, isValidRole } from "../middleware/auth";
import * as userController from "../controllers/userController";

const router = Router();

router.use(authMiddleware, isValidRole);

router.get("/grocery-items", userController.getGroceryItems);
router.post("/orders", authMiddleware, userController.createOrder);

export default router;
