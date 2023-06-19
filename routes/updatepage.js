import express from "express";
import { Updatepage12 } from "../controllers/Updatepage.js";
const router = express.Router()

//signUP
router.post('/page_Update', Updatepage12)


export default router;