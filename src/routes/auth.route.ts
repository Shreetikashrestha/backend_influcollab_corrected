import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

let authController = new AuthController();
const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);


router.get('/',(req, res) => {
    res.send('Auth route is working');
});

export default router;
