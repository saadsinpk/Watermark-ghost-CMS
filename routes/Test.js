import express from "express";
import { menber } from "../controllers/test1.js";
import { nodemailer1 } from "../controllers/test1.js";
const router = express.Router()

//signUP
router.post('/menber', menber)



router.post('/nodemailer', nodemailer1)

export default router;