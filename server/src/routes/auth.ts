import express from 'express';
import {
	signup as signupController,
	login as loginController,
} from '../controllers/auth';

const authRouter = express.Router();

authRouter.post('/signup', signupController);
authRouter.post('/login', loginController);

export { authRouter };
