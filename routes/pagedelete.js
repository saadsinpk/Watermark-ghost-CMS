import express from "express";
import { pagedelete } from "../controllers/PageDelete.js";
const router = express.Router()

//signUP
router.post('/page_delete', pagedelete)


export default router;