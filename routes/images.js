

import express from "express";
import multer from "multer";
import path from "path";
import { readFile, writeFile, mkdir } from 'fs/promises';
import sharp from 'sharp';
import e from "express";
import cloudinary from 'cloudinary';
import IMAGE from '../models/image.js';
import axios from 'axios';


const router = express.Router();
const app = express();


cloudinary.config({
    cloud_name: 'dpuampgi2',
    api_key: '737194746156619',
    api_secret: '76PFeFR5akqA53UcFDiNRDGbp1A'
});

const storage = multer.diskStorage({
    destination: './public',
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.array('image'), async (req, res, next) => {
    const images = req.files;
    for (const image of images) {
        console.log(`https://oemdieselparts.com/pic/` + image.filename);
        try {
            const response = await axios.post(
                "https://oemdieselparts.com/pic/changewatermark",
                {
                    // Request payload data
                    id: "648ab1684855601a64bcdf5d",
                    imagewatermark: `https://oemdieselparts.com/pic/` + image.filename,
                }
            );

        } catch (error) {
            console.error(error); // Handle the error
        }
        res.status(200).send(`https://oemdieselparts.com/pic/` + image.filename);
    }
});

export default router;



