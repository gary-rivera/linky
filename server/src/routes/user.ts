import express from 'express';
import { getUserUrls } from '../controllers/user';
const userRouter = express.Router();

userRouter.get('/urls', getUserUrls);
export { userRouter };
