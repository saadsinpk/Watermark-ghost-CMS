import express from "express";
import { page12 } from "../controllers/page.js";
const router = express.Router()

//signUP
router.post('/post_Page', page12)


export default router;