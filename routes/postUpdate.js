import express from "express";
import { Update } from "../controllers/PostUpdate.js";
const router = express.Router()

//signUP
router.post('/post_Update', Update)


export default router;