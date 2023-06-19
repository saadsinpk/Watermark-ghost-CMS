import express from "express";
import { Allimage } from "../controllers/generate.js";

const router = express.Router()


router.post('/Alldata', Allimage)


export default router;