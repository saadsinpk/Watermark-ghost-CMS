import express from "express";
import { getStaff } from "../controllers/getStaff.js";

const router = express.Router()
router.get('/getStaff', getStaff)
export default router;