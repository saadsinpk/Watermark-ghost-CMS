import express from "express";
import { addStaff } from "../controllers/addStaff.js";
const router = express.Router()

//signUP
router.post('/addStaff', addStaff)


export default router;