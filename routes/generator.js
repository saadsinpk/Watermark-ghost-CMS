import express from "express";
import { Allimage } from "../controllers/generate.js";

const router = express.Router()
router.get('/generatetest', Allimage)
export default router;