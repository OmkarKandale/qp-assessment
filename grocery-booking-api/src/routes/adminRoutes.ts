import { Router } from "express";
import { authMiddleware, isAdmin } from "../middleware/auth";
import * as adminController from "../controllers/adminController";

const router = Router();

router.use(authMiddleware, isAdmin);

router.post("/grocery-items", adminController.addGroceryItem);
router.put("/grocery-items/:id", adminController.updateGroceryItem);

export default router;
