import axios from "axios";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import ReplaceStatus from "../models/replacepage.js";
import watermark from '../models/watermark.js'
import staff from '../models/staff.js'
import fsx from 'fs-extra';
import { Console } from "console";
import { createCanvas, loadImage } from 'canvas';
import fileCache from 'node-file-cache';
import cache from '../cacheManager.js';

async function adjustOpacity(imageBuffer, opacity) {
  const img = await loadImage(imageBuffer);
  const canvas = createCanvas(img.width, img.height);
  const context = canvas.getContext('2d');
  context.globalAlpha = opacity;
  context.drawImage(img, 0, 0, img.width, img.height);
  return canvas.toBuffer();
}



export const Allimage = async (req, res, next) => {
  try {
    const id = req.params.id;
    const segment1 = req.params.segment1;
    let segment2 = req.params.segment2;
    let img_url;
    if(req.params.segment3 && req.params.segment4 && req.params.segment5) {
    	segment2 = segment2.replace('content', "");
	    img_url = "https://oemdieselparts.com/content/images/"+id+"/"+segment1+"/"+segment2;
    } else {
	    img_url = "https://oemdieselparts.com/content/images/"+id+"/"+segment1+"/"+segment2;
    }
    const cachedImage = cache.get(img_url);
    if (cachedImage) {
	  const cachedImageBuffer = Buffer.from(cachedImage, 'base64');
      res.setHeader("Content-Type", "image/png");
      res.send(cachedImageBuffer);
      return;
    }

	await axios.head(img_url);

	const response = await axios.get(img_url, { responseType: "arraybuffer" });
	const imageBuffer = Buffer.from(response.data, "binary");
	const image = await sharp(imageBuffer);

    const replaceStatus = await ReplaceStatus.findOne({ "feature_imageold": img_url });

    const staffdetail = await staff.findOne({ "member.current.email": replaceStatus.AuthEmail });
	let watermarkedImageBuffer = '';
    if (staffdetail && staffdetail._id) {
	    const watermarkchange = await watermark.findOne({ "userID": staffdetail._id.toString() });

		if (watermarkchange.watermarktype === "image" && watermarkchange.watermarktypeenable == 'enable') {
			const metadata = await image.metadata();
			const watermarkWidth = metadata.width;
			const watermarkHeight = metadata.height;
			const watermarkImagePath = watermarkchange.imagewatermark;
			let offsetx = watermarkchange.offsetx;
			let offsety = watermarkchange.offsety;
			let topalign = 0;


			let leftalign = 0;


			try {
				if(offsetx > 0) {
					offsetx = Math.floor(watermarkWidth * offsetx / 100);
				}
				if(offsety > 0) {
					offsety = Math.floor(watermarkWidth * offsety / 100);
				}
				const watermarkResponse = await axios.get(watermarkImagePath, { responseType: "arraybuffer" });
				const watermarkBuffer = Buffer.from(watermarkResponse.data, "binary");
				const watermarkBufferWithOpacity = await adjustOpacity(watermarkBuffer, watermarkchange.opacity / 100);  // Adjust opacity as needed
				const watermarkImageSharp = await sharp(watermarkBufferWithOpacity);
				const water_metadata = await watermarkImageSharp.metadata();

				let new_width = Math.floor(watermarkWidth * watermarkchange.widthscale / 100);
				let new_height = Math.floor((new_width / water_metadata.width) * water_metadata.height);


				let leftSpace = watermarkWidth - new_width;
				let topSpace = watermarkHeight - new_height;

				if(watermarkchange.alignment == 1) {
					topalign = parseInt(Math.floor(0)) + parseInt(offsety);
					leftalign = parseInt(Math.floor(0)) + parseInt(offsetx);
				} else if(watermarkchange.alignment == 2) {
					topalign = parseInt(Math.floor(0)) + parseInt(offsety);
					leftalign = parseInt(Math.floor(leftSpace)) / parseInt(2);
				} else if(watermarkchange.alignment == 3) {
					topalign = parseInt(Math.floor(0)) + parseInt(offsety);
					leftalign = parseInt(Math.floor(leftSpace)) - parseInt(offsetx);
				} else if(watermarkchange.alignment == 4) {
					topalign = parseInt(Math.floor(topSpace / 2)) + parseInt(offsety);
					leftalign = parseInt(Math.floor(0)) + parseInt(offsetx);
				} else if(watermarkchange.alignment == 5) {
					topalign = parseInt(Math.floor(topSpace / 2)) + parseInt(offsety);
					leftalign = parseInt(Math.floor(leftSpace)) / parseInt(2);
				} else if(watermarkchange.alignment == 6) {
					topalign = parseInt(Math.floor(topSpace / 2)) + parseInt(offsety);
					leftalign = parseInt(Math.floor(leftSpace)) - parseInt(offsetx);
				} else if(watermarkchange.alignment == 7) {
					topalign = parseInt(Math.floor(topSpace)) - parseInt(offsety);
					leftalign = parseInt(Math.floor(0)) + parseInt(offsetx);
				} else if(watermarkchange.alignment == 8) {
					topalign = parseInt(Math.floor(topSpace)) - parseInt(offsety);
					leftalign = parseInt(Math.floor(leftSpace)) / parseInt(2);
				} else if(watermarkchange.alignment == 9) {
					topalign = parseInt(Math.floor(topSpace)) - parseInt(offsety);
					leftalign = parseInt(Math.floor(leftSpace)) - parseInt(offsetx);
				}


				const watermarkImage = await watermarkImageSharp
					.resize(new_width, new_height, { fit: 'inside' })
					.ensureAlpha()
					.toBuffer();

				watermarkedImageBuffer = await image
					.clone()
					.composite([{ input: watermarkImage, top: topalign, left: leftalign }])
					.toBuffer();
			} catch (error) {
				watermarkedImageBuffer = await image
					.clone()
					.toBuffer();
			}

		} else {
			watermarkedImageBuffer = await image
				.clone()
				.toBuffer();
		}
        cache.set(img_url, watermarkedImageBuffer.toString('base64'));
    	// console.log(watermarkedImageBuffer);

		res.setHeader("Content-Type", "image/png");
     	res.send(watermarkedImageBuffer);
	} else {
		watermarkedImageBuffer = await image
			.clone()
			.toBuffer();

		cache.set(img_url, watermarkedImageBuffer.toString('base64'));

		res.setHeader("Content-Type", "image/png");
     	res.send(watermarkedImageBuffer);
	}

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};