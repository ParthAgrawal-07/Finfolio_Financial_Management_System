import { Router } from "express";
import { getUserById, listUsers } from "../controllers/userController";

const router = Router();

router.get("/", listUsers);
router.get("/:userId", getUserById);

export default router;
