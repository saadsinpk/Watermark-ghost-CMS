import express from "express";
import { getSingleStaff } from "../controllers/getSingleStaff.js";

const router = express.Router()
router.get('/getSingleStaff', getSingleStaff)
export default router;