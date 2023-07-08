import express from "express";
import { Allimage } from "../controllers/generate.js";

const router = express.Router()
router.get('/Alldata', Allimage)
export default router;