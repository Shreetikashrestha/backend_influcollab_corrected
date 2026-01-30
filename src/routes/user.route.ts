import { Router } from "express";
// import { UserController } from "../../controllers/user.controller";
// import { authorizedMiddleware } from "../../middleware/authorization.middleware";

// let userController = new UserController();
const router = Router();

// router.use(authorizedMiddleware);

// Example user routes (implement controller as needed)
router.get('/', (req, res) => res.send('Get all users'));
router.get('/:id', (req, res) => res.send(`Get user with id ${req.params.id}`));
router.put('/:id', (req, res) => res.send(`Update user with id ${req.params.id}`));
router.delete('/:id', (req, res) => res.send(`Delete user with id ${req.params.id}`));

export default router;
