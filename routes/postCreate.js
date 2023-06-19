import express from "express";
import { Create1 } from "../controllers/PostCteate.js";
const router = express.Router()

//signUP
router.post('/post_create', Create1)


export default router;