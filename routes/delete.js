import express from "express";
import { Delete12 } from "../controllers/Delete.js";
const router = express.Router()

//signUP
router.post('/post_Delete', Delete12)


export default router;