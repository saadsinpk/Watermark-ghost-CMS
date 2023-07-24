import express from "express";
import { deleteStaff } from "../controllers/deleteStaff.js";
const router = express.Router()

//signUP
router.post('/deleteStaff', deleteStaff)


export default router;