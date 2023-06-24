

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
// const { style } = req.body;

// try {
//     for (let i = 0; i < images.length; i++) {
//         const image12 = images[i];
//         const ext = path.extname(image12.originalname);
//         const imgPath = image12.path; // Construct the correct image path

//         cloudinary.uploader.upload(imgPath, async (result, error) => {
//             if (error) {
//                 console.error(error, "Error uploading image");
//             } else {
//                 const save1 = new IMAGE({ ...result });
//                 await save1.save();
//                 console.log(result, "Image uploaded successfully");
//             }
//         });
//         if (!!imgPath) {
//             const imageBuffer = await readFile(imgPath);
//             const textWatermark = 'Watermark';
//             const watermarkColor = 'rgba(255, 255, 255, 0.5)'; // Adjust the watermark color here

//             const image = await sharp(imageBuffer);

//             const metadata = await image.metadata();
//             const watermarkWidth = (metadata.width);
//             const watermarkHeight = (metadata.height);
//             console.log(watermarkWidth, watermarkHeight);

//             let watermark;
//             if (style === 'Center') {
//                 watermark = await sharp({
//                     create: {
//                         width: watermarkWidth,
//                         height: watermarkHeight,
//                         channels: 4,
//                         background: { r: 0, g: 0, b: 0, alpha: 0 }
//                     }
//                 })
//                     .png()
//                     .composite([
//                         {
//                             input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
//                                         <text x="${watermarkWidth / 2}" y="${watermarkHeight / 2}" font-size="24" fill="${watermarkColor}" text-anchor="middle" alignment-baseline="middle">${textWatermark}</text>
//                                     </svg>
//                                     `),
//                             blend: 'over',
//                         },
//                     ])
//                     .toBuffer();
//             } else if (style === 'top-left') {
//                 watermark = await sharp({
//                     create: {
//                         width: watermarkWidth,
//                         height: watermarkHeight,
//                         channels: 4,
//                         background: { r: 0, g: 0, b: 0, alpha: 0 }
//                     }
//                 })
//                     .png()
//                     .composite([
//                         {
//                             input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
//                                         <text x="${watermarkWidth / 4}" y="${watermarkHeight / 9}" font-size="24" fill="${watermarkColor}" text-anchor="middle" alignment-baseline="middle">${textWatermark}</text>
//                                     </svg>
//                                     `),
//                             blend: 'over',
//                         },
//                     ])
//                     .toBuffer();
//             } else if (style === 'top-Right') {
//                 watermark = await sharp({
//                     create: {
//                         width: watermarkWidth,
//                         height: watermarkHeight,
//                         channels: 4,
//                         background: { r: 0, g: 0, b: 0, alpha: 0 }
//                     }
//                 })
//                     .png()
//                     .composite([
//                         {
//                             input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
//                                         <text x="${watermarkWidth / 1.3}" y="${watermarkHeight / 9}" font-size="24" fill="${watermarkColor}" text-anchor="middle" alignment-baseline="middle">${textWatermark}</text>
//                                     </svg>
//                                     `),
//                             blend: 'over',
//                         },
//                     ])
//                     .toBuffer();
//             } else if (style === 'BottomRight') {
//                 watermark = await sharp({
//                     create: {
//                         width: watermarkWidth,
//                         height: watermarkHeight,
//                         channels: 4,
//                         background: { r: 0, g: 0, b: 0, alpha: 0 }
//                     }
//                 })
//                     .png()
//                     .composite([
//                         {
//                             input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
//                                         <text x="${watermarkWidth / 1.3}" y="${watermarkHeight / 1.1}" font-size="24" fill="${watermarkColor}" text-anchor="middle" alignment-baseline="middle">${textWatermark}</text>
//                                     </svg>
//                                     `),
//                             blend: 'over',
//                         },
//                     ])
//                     .toBuffer();
//             } else if (style === 'BottomLeft') {
//                 watermark = await sharp({
//                     create: {
//                         width: watermarkWidth,
//                         height: watermarkHeight,
//                         channels: 4,
//                         background: { r: 0, g: 0, b: 0, alpha: 0 }
//                     }
//                 })
//                     .png()
//                     .composite([
//                         {
//                             input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
//                                         <text x="${watermarkWidth / 4}" y="${watermarkHeight / 1.1}" font-size="24" fill="${watermarkColor}" text-anchor="middle" alignment-baseline="middle">${textWatermark}</text>
//                                     </svg>
//                                     `),
//                             blend: 'over',
//                         },
//                     ])
//                     .toBuffer();
//             } else {
//                 watermark = await sharp({
//                     create: {
//                         width: watermarkWidth,
//                         height: watermarkHeight,
//                         channels: 4,
//                         background: { r: 0, g: 0, b: 0, alpha: 0 }
//                     }
//                 })
//                     .png()
//                     .composite([
//                         {
//                             input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
//                                     <text x="${watermarkWidth / 100}" y="${watermarkHeight / 9.5}" font-size="24" fill="${watermarkColor}">${textWatermark}</text>
//                                     <text x="${watermarkWidth / 5}" y="${watermarkHeight / 3.4}" font-size="24" fill="${watermarkColor}">${textWatermark}</text>
//                                     <text x="${watermarkWidth / 2.5}" y="${watermarkHeight / 2}" font-size="24" fill="${watermarkColor}">${textWatermark}</text>
//                                     <text x="${watermarkWidth / 1.7}" y="${watermarkHeight / 1.4}" font-size="24" fill="${watermarkColor}">${textWatermark}</text>
//                                     <text x="${watermarkWidth / 1.3}" y="${watermarkHeight / 1.1}" font-size="24" fill="${watermarkColor}">${textWatermark}</text>
//                                 </svg>
//                                 `),
//                             blend: 'over',
//                         },
//                     ])
//                     .toBuffer();
//             }
//             const fileExtension = path.extname(image12.originalname);
//             const fileName = `watermarked-${Date.now()}${fileExtension}`;
//             const filePath = path.resolve('./public/uploads', fileName);

//             await mkdir(path.dirname(filePath), { recursive: true }); // Create directories if they don't exist
//             await image.composite([{ input: watermark }])
//                 .toFile(filePath);

//             // res.json({
//             //     url: `/uploads/${fileName}`,
//             // });
//         } else {
//             next(new Error('No file found'));
//         }

//     }


//     res.status(200).json({ message: 'Images uploaded successfully' });
// } catch (error) {
//     console.error('Error uploading images:', error);
//     res.status(500).json({ error: 'Image upload failed' });
// }

// console.log(req.file.path);
//     if (!!req.file) {
//         const imageBuffer = await readFile(req.file.path);
//         const textWatermark = 'Watermark';
//         const watermarkColor = 'rgba(255, 255, 255, 0.5)'; // Adjust the watermark color here

//         const image = await sharp(imageBuffer);

//         const metadata = await image.metadata();
//         const watermarkWidth = (metadata.width);
//         const watermarkHeight = (metadata.height);
//         console.log(watermarkWidth, watermarkHeight);

//         let watermark;
//         if (style === 'Center') {
//             watermark = await sharp({
//                 create: {
//                     width: watermarkWidth,
//                     height: watermarkHeight,
//                     channels: 4,
//                     background: { r: 0, g: 0, b: 0, alpha: 0 }
//                 }
//             })
//                 .png()
//                 .composite([
//                     {
//                         input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
//                             <text x="${watermarkWidth / 2}" y="${watermarkHeight / 2}" font-size="24" fill="${watermarkColor}" text-anchor="middle" alignment-baseline="middle">${textWatermark}</text>
//                         </svg>
//                         `),
//                         blend: 'over',
//                     },
//                 ])
//                 .toBuffer();
//         } else if (style === 'top-left') {
//             watermark = await sharp({
//                 create: {
//                     width: watermarkWidth,
//                     height: watermarkHeight,
//                     channels: 4,
//                     background: { r: 0, g: 0, b: 0, alpha: 0 }
//                 }
//             })
//                 .png()
//                 .composite([
//                     {
//                         input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
//                             <text x="${watermarkWidth / 4}" y="${watermarkHeight / 9}" font-size="24" fill="${watermarkColor}" text-anchor="middle" alignment-baseline="middle">${textWatermark}</text>
//                         </svg>
//                         `),
//                         blend: 'over',
//                     },
//                 ])
//                 .toBuffer();
//         } else if (style === 'top-Right') {
//             watermark = await sharp({
//                 create: {
//                     width: watermarkWidth,
//                     height: watermarkHeight,
//                     channels: 4,
//                     background: { r: 0, g: 0, b: 0, alpha: 0 }
//                 }
//             })
//                 .png()
//                 .composite([
//                     {
//                         input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
//                             <text x="${watermarkWidth / 1.3}" y="${watermarkHeight / 9}" font-size="24" fill="${watermarkColor}" text-anchor="middle" alignment-baseline="middle">${textWatermark}</text>
//                         </svg>
//                         `),
//                         blend: 'over',
//                     },
//                 ])
//                 .toBuffer();
//         }else if (style === 'BottomRight') {
//             watermark = await sharp({
//                 create: {
//                     width: watermarkWidth,
//                     height: watermarkHeight,
//                     channels: 4,
//                     background: { r: 0, g: 0, b: 0, alpha: 0 }
//                 }
//             })
//                 .png()
//                 .composite([
//                     {
//                         input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
//                             <text x="${watermarkWidth / 1.3}" y="${watermarkHeight / 1.1}" font-size="24" fill="${watermarkColor}" text-anchor="middle" alignment-baseline="middle">${textWatermark}</text>
//                         </svg>
//                         `),
//                         blend: 'over',
//                     },
//                 ])
//                 .toBuffer();
//         } else if (style === 'BottomLeft') {
//             watermark = await sharp({
//                 create: {
//                     width: watermarkWidth,
//                     height: watermarkHeight,
//                     channels: 4,
//                     background: { r: 0, g: 0, b: 0, alpha: 0 }
//                 }
//             })
//                 .png()
//                 .composite([
//                     {
//                         input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
//                             <text x="${watermarkWidth / 4}" y="${watermarkHeight / 1.1}" font-size="24" fill="${watermarkColor}" text-anchor="middle" alignment-baseline="middle">${textWatermark}</text>
//                         </svg>
//                         `),
//                         blend: 'over',
//                     },
//                 ])
//                 .toBuffer();
//         } else {
//             watermark = await sharp({
//                 create: {
//                     width: watermarkWidth,
//                     height: watermarkHeight,
//                     channels: 4,
//                     background: { r: 0, g: 0, b: 0, alpha: 0 }
//                 }
//             })
//                 .png()
//                 .composite([
//                     {
//                         input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
//                         <text x="${watermarkWidth / 100}" y="${watermarkHeight / 9.5}" font-size="24" fill="${watermarkColor}">${textWatermark}</text>
//                         <text x="${watermarkWidth / 5}" y="${watermarkHeight / 3.4}" font-size="24" fill="${watermarkColor}">${textWatermark}</text>
//                         <text x="${watermarkWidth / 2.5}" y="${watermarkHeight / 2}" font-size="24" fill="${watermarkColor}">${textWatermark}</text>
//                         <text x="${watermarkWidth / 1.7}" y="${watermarkHeight / 1.4}" font-size="24" fill="${watermarkColor}">${textWatermark}</text>
//                         <text x="${watermarkWidth / 1.3}" y="${watermarkHeight / 1.1}" font-size="24" fill="${watermarkColor}">${textWatermark}</text>
//                     </svg>
//                     `),
//                         blend: 'over',
//                     },
//                 ])
//                 .toBuffer();
//         }
//         const fileExtension = path.extname(req.file.originalname);
//         const fileName = `watermarked-${Date.now()}${fileExtension}`;
//         const filePath = path.resolve('./public/uploads', fileName);

//         await mkdir(path.dirname(filePath), { recursive: true }); // Create directories if they don't exist
//         await image.composite([{ input: watermark }])
//             .toFile(filePath);

//         res.json({
//             url: `/uploads/${fileName}`,
//         });
//     } else {
//         next(new Error('No file found'));
//     }
// });
// })
export default router;



