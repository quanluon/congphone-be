import { Router } from "express";
import { adminUserController } from "../../controllers/admin/user.controller";

const router = Router();

router.get("/", adminUserController.listUsers.bind(adminUserController));
router.put("/:id", adminUserController.updateUser.bind(adminUserController));

export default router;
