import express from "express";
import { updateStaff } from "../controllers/updateStaff.js";
const router = express.Router()

//signUP
router.post('/updateStaff', updateStaff)


export default router;