import express from "express";
import { Update } from "../controllers/PostUpdate.js";
const router = express.Router()

//signUP
router.post('/post_update', Update)


export default router;