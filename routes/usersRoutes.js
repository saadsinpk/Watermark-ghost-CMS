import express from "express";
import { signUp } from "../controllers/user.js";
import { signin } from "../controllers/user.js";

const router = express.Router()

//signUP
router.post('/signup', signUp)
// signin
router.post('/signin', signin)
//google signin
router.post('/test')
export default router;