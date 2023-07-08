import express from "express";
import { Allimage } from "../controllers/DynamicImage.js";

const router = express.Router()


router.get('/:id/:segment1/:segment2', Allimage)
router.get('/:id/:segment1/:segment2/:segment3/:segment4/:segment5', Allimage)


export default router;