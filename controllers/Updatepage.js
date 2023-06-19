



import mongoose from "mongoose";
import Page from "../models/Page.js";
import axios from "axios";
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import Imagemain from '../models/ImageSchema.js';
import jwt from "jsonwebtoken";
import ReplaceStatus from '../models/replacepage.js'




const key = '5f9a86ae980832579ebe5e17:c2704ca585b2084347903b9f8aff6f47a13e034440391c41dbc1139f128cc25b';
const [id, secret] = key.split(':');

const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
  keyid: id,
  algorithm: 'HS256',
  expiresIn: '50m',
  audience: '/admin/'
});


let obj = {};


export const Updatepage12 = async (req, res, next) => {
  const postId = req.body.page.current.id;
  obj.id = postId;
  let updatedData = req.body;

  let imageUrl2;
  const updatedCards = [];
  const updatedCards_define = [];
  let mobiledoc;
  if (req.body.page.current.mobiledoc) {
    mobiledoc = JSON.parse(req.body.page.current.mobiledoc);

    let cards = mobiledoc.cards;
    if (cards) {
      imageUrl2 =
        cards[0] && cards[0][1] && cards[0][1]?.src && cards[0][1]?.src;
      if (imageUrl2) {
        for (const card of mobiledoc.cards) {
          if (card[0] === "image") {
            const imageUrl = card[1].src;
            updatedCards.push(imageUrl);
            updatedCards_define.push("Card");
          }
        }
      }
    }
  }
  updatedCards.push(req.body.page.current.feature_image);
  updatedCards_define.push("Feature");

  let currentDate;
  let currentTitle;
  let payload;
  let featureImage = '';
  const mobiledoc_updated = JSON.parse(req.body.page.current.mobiledoc);




  async function addWatermarkToImage(imageUrl) {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(response.data, "binary");
    const imageFolderPath = "./public";
    const imageFilename = `image_${Date.now()}.png`;
    const svgPath = path.join(imageFolderPath, "image.png");
    const pngPath = path.join(imageFolderPath, imageFilename);

    if (fs.existsSync(svgPath)) {
      fs.unlinkSync(svgPath);
    }

    const textWatermark = "Watermark";
    const watermarkColor = "rgba(255, 255, 255, 0.5)";

    const image = await sharp(imageBuffer);
    const metadata = await image.metadata();
    const watermarkWidth = metadata.width;
    const watermarkHeight = metadata.height;

    const watermarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
                            <text x="${watermarkWidth / 2}" y="${watermarkHeight / 2
      }" font-size="24" fill="${watermarkColor}" text-anchor="middle" alignment-baseline="middle">${textWatermark}</text>
                          </svg>`;

    const watermark = await sharp(Buffer.from(watermarkSvg)).png().toBuffer();

    let filePath = "";

    filePath = path.join(imageFolderPath, `watermarked_${Date.now()}.png`);
    await image.composite([{ input: watermark }]).toFile(filePath);
    const ReplaceStatussave = new ReplaceStatus({
      id: postId,
      feature_imageold: imageUrl,
      feature_image: `https://oemdieselparts.com/pic/${filePath.split("/")[1]}`,
      hasWatermark: true,
      DocumentType: "page",
    });
    await ReplaceStatussave.save();
    return filePath;
  }
  const watermarkPromises = [];

  for (let i = 0; i < updatedCards.length; i++) {
    const mongoID = await ReplaceStatus.findOne({
      $or: [
        { feature_imageold: updatedCards[i] },
        { feature_image: updatedCards[i] },
      ],
    });
    if (!mongoID) {
      const watermarkPromise = addWatermarkToImage(updatedCards[i])
        .then((watermarkedImagePath) => {

          currentDate = req.body.page.current.updated_at;
          currentTitle = req.body.page.current.title;

          if (updatedCards_define[i] === 'Feature') {
            console.log("Feature work");
            featureImage = `https://oemdieselparts.com/pic/${watermarkedImagePath.split("/")[1]}`;
          } else {
            if (req.body.page.current.mobiledoc) {
              const cards = mobiledoc_updated.cards;

              if (cards) {
                for (const [index, card] of cards.entries()) {
                  if (card[0] === 'image' && card[1].src === updatedCards[i]) {
                    mobiledoc_updated.cards[index][1].src = `https://oemdieselparts.com/pic/${watermarkedImagePath.split("/")[1]}`;
                  }
                }
                // }
              }
            }
          }

        })
        .catch((error) => {
          console.error("Error adding watermark to image:", error);
        });
      watermarkPromises.push(watermarkPromise);
    }
  }

  const url = `https://oemdieselparts.com/ghost/api/admin/pages/${postId}`;
  const headers = {
    Authorization: `Ghost ${token}`,
  };

  Promise.all(watermarkPromises)
    .then(() => {
      if (currentDate != '' && currentTitle != '' && typeof currentDate !== 'undefined' && typeof currentTitle !== 'undefined') {
        if (featureImage != '' && currentDate != '' && currentTitle != '' && typeof currentDate !== 'undefined' && typeof currentTitle !== 'undefined') {
          payload = {
            pages: [
              {
                id: `${postId}`,
                updated_at: currentDate,
                title: currentTitle,
                feature_image: featureImage,
                mobiledoc: JSON.stringify(mobiledoc_updated)
              }
            ]
          };
        } else {
          payload = {
            pages: [
              {
                id: `${postId}`,
                updated_at: currentDate,
                title: currentTitle,
                mobiledoc: JSON.stringify(mobiledoc_updated)
              }
            ]
          };
        }
      }

      if (payload != '' && typeof payload !== 'undefined') {
        console.log(payload);
        const checkFields = async () => {
          try {
            const response = await axios.put(url, payload, { headers });
            console.log(response.data, 'Feature SUCCESS');
          } catch (error) {
            console.error(error.response.data.errors, 'ERR');
          }
        };
        checkFields();
      }
    })
    .catch((error) => {
      console.error("Error adding watermark to images:", error);
    });




  // const postId = req.body.page.current.id;
  // let updatedData = req.body;

  // let imageUrl2;
  // if (req.body.page.current.mobiledoc) {
  //   const mobiledoc = JSON.parse(req.body.page.current.mobiledoc);
  //   const cards = mobiledoc.cards;
  //   if (cards) {
  //     imageUrl2 = cards[0] && cards[0][1] && cards[0][1]?.src && cards[0][1]?.src;
  //   }
  // }
  // const mongoID = await ReplaceStatus.findOne({ 'id': postId });
  // // console.log(mongoID, postId, "mongoIDmongoIDmongoID");
  // // console.log(req.body.page.current.updated_at, "req.body.page.current.updated_at");

  // let update_at12;
  // let mongoIDimg1;
  // let mongoIDimg2;
  // if (mongoID) {
  //   let { updatedAt, imageUrl, cardsimage } = mongoID;
  //   // console.log(updatedAt, "saad123456");
  //   update_at12 = updatedAt;
  //   mongoIDimg1 = imageUrl;
  //   mongoIDimg2 = cardsimage;
  // }
  // console.log(req.body.page.current.feature_image, "sfd", mongoIDimg1);
  // if (mongoIDimg1 === req.body.page.current.feature_image || update_at12 == req.body.page.current.updated_at) {
  //   res.status(400).json({ message: 'Update already in progress' });
  //   console.log('already');
  //   return;
  // }
  // try {
  //   const page = await Page.findOneAndUpdate(
  //     { 'page.current.id': postId },
  //     {
  //       $set: {
  //         'page.current.title': updatedData.page.current.title,
  //         'page.current.excerpt': updatedData.page.current.excerpt,
  //         'page.current.html': updatedData.page.current.html,
  //         'page.current.feature_image': updatedData.page.current.feature_image,
  //       },
  //     },
  //     { new: true }
  //   );

  //   const imageUrl = updatedData.page.current.feature_image;

  //   if (obj.id !== postId) {
  //     const ImagemainSave = new Imagemain({ ...imageUrl });
  //     await ImagemainSave.save();
  //   }

  //   if (update_at12 !== req.body.page.current.updated_at || !image55) {
  //     const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  //     const imageBuffer = Buffer.from(response.data, 'binary');
  //     const imageFolderPath = './public';
  //     const imageFilename = `image_${Date.now()}.png`;
  //     const svgPath = path.join(imageFolderPath, 'image.png');
  //     var pngPath = path.join(imageFolderPath, imageFilename);

  //     if (fs.existsSync(svgPath)) {
  //       fs.unlinkSync(svgPath);
  //     }

  //     const textWatermark = 'Watermark';
  //     const watermarkColor = 'rgba(255, 255, 255, 0.5)';

  //     const image = await sharp(imageBuffer);
  //     const metadata = await image.metadata();
  //     const watermarkWidth = metadata.width;
  //     const watermarkHeight = metadata.height;

  //     const watermarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth}" height="${watermarkHeight}">
  //                           <text x="${watermarkWidth / 2}" y="${watermarkHeight / 2}" font-size="24" fill="${watermarkColor}" text-anchor="middle" alignment-baseline="middle">${textWatermark}</text>
  //                         </svg>`;

  //     const watermark = await sharp(Buffer.from(watermarkSvg))
  //       .png()
  //       .toBuffer();
  //     let filePath = '';

  //     if (isFunctionRunning <= 1) {
  //       filePath = path.join(imageFolderPath, `watermarked_${Date.now()}.png`);
  //       await image.composite([{ input: watermark }])
  //         .toFile(filePath);
  //     }

  //     imagePath = filePath;
  //     image55 = filePath;
  //   }
  //   if (!imageUrl2) {
  //     console.log("hello");
  //   }

  //   if (!image56 && imageUrl2 || imageUrl2 && updated_at !== req.body.page.current.updated_at) {
  //     const response1 = await axios.get(imageUrl2, { responseType: 'arraybuffer' });
  //     const imageBuffer1 = Buffer.from(response1.data, 'binary');
  //     const imageFolderPath1 = './public';
  //     const imageFilename1 = `image_${Date.now()}.png`;
  //     const svgPath1 = path.join(imageFolderPath1, 'image.png');
  //     var pngPath1 = path.join(imageFolderPath1, imageFilename1);

  //     if (fs.existsSync(svgPath1)) {
  //       fs.unlinkSync(svgPath1);
  //     }

  //     const textWatermark1 = 'Watermark';
  //     const watermarkColor1 = 'rgba(255, 255, 255, 0.5)';

  //     const image1 = await sharp(imageBuffer1);
  //     const metadata1 = await image1.metadata();
  //     const watermarkWidth1 = metadata1.width;
  //     const watermarkHeight1 = metadata1.height;

  //     const watermarkSvg1 = `<svg xmlns="http://www.w3.org/2000/svg" width="${watermarkWidth1}" height="${watermarkHeight1}">
  //                             <text x="${watermarkWidth1 / 2}" y="${watermarkHeight1 / 2}" font-size="24" fill="${watermarkColor1}" text-anchor="middle" alignment-baseline="middle">${textWatermark1}</text>
  //                           </svg>`;

  //     const watermark1 = await sharp(Buffer.from(watermarkSvg1))
  //       .png()
  //       .toBuffer();
  //     let filePath1 = '';

  //     if (isFunctionRunning <= 1) {
  //       filePath1 = path.join(imageFolderPath1, `watermarked_${Date.now()}.png`);
  //       await image1.composite([{ input: watermark1 }])
  //         .toFile(filePath1);
  //     }

  //     imagePath1 = filePath1;
  //     image56 = filePath1;
  //   }

  //   updated_at = req.body.page.current.updated_at;
  //   // console.log(imageUrl2, "imageUrl2imageUrl2");

  //   // await Page.findOneAndUpdate(
  //   //   { 'page.current.id': postId },
  //   //   { $set: { 'page.current.feature_image': imagePath } },
  //   //   { new: true }
  //   // );
  //   // console.log(imagePath1, "imagePath1imagePath1imagePath1imagePath1");
  //   let currentDate;
  //   let currentTitle;
  //   let imagesplit = await imagePath.split("/")[1];
  //   let imagesplit1 = await imagePath1?.split("/")[1];

  //   // console.log(imagesplit, "imagesplit");

  //   const url = `https://oemdieselparts.com/ghost/api/admin/pages/${postId}`;
  //   const headers = {
  //     Authorization: `Ghost ${token}`,
  //   };
  //   const url1 = 'http://oemdieselparts.com/ghost/api/v3/content/pages/?key=62ba5f4d0ae64abf8445ee2054';

  //   await axios.get(url1)
  //     .then(response => {
  //       if (response.data.pages[0]) {
  //         for (let i = 0; i < 3; i++) {
  //           console.log(response.data.pages[i]);
  //         }
  //         response.data.pages.map((v, i) => {
  //           console.log(v.id, "id");
  //           if (v.id === `${postId}`) {
  //             currentDate = v.updated_at;
  //             currentTitle = v.title;
  //             console.log(currentDate, "saad");
  //           }
  //         })
  //       }
  //     })
  //     .catch(error => {
  //       console.error(error);
  //     });

  //   // console.log(currentDate, currentTitle, postId, imagesplit, "postId");
  //   let data = {
  //     "version": "0.3.1",
  //     "atoms": [],
  //     "cards": [
  //       [
  //         "image",
  //         {
  //           "src": `https://oemdieselparts.com/pic/${imagesplit1}`,
  //           "width": 275,
  //           "height": 183
  //         }
  //       ]
  //     ],
  //     "markups": [],
  //     "sections": [
  //       [10, 0],
  //       [1, "p", []]
  //     ],
  //     "ghostVersion": "4.0"
  //   }
  //   // const parsedObject = JSON.parse(data);
  //   let payload;
  //   if (imageUrl2) {
  //     payload = {
  //       pages: [
  //         {
  //           id: `${postId}`,
  //           updated_at: currentDate,
  //           title: currentTitle,
  //           feature_image: `https://oemdieselparts.com/pic/${imagesplit}`,
  //           mobiledoc: JSON.stringify(data)
  //         }
  //       ]
  //     };
  //   } else {
  //     payload = {
  //       pages: [
  //         {
  //           id: `${postId}`,
  //           updated_at: currentDate,
  //           title: currentTitle,
  //           feature_image: `https://oemdieselparts.com/pic/${imagesplit}`,
  //         }
  //       ]
  //     };
  //   }


  //   const checkFields = async () => {
  //     if (currentDate && imagesplit && imageUrl2) {
  //       if (mongoID && update_at12 !== req.body.page.current.updated_at) {
  //         await axios.put(url, payload, { headers })
  //           .then(response => console.log(response.data, 'SUCCESS'))
  //           .catch(error => console.error(error.response.data.errors[0].details, 'ERR'));
  //         console.log("sahi h");
  //         await ReplaceStatus.findOneAndUpdate(
  //           { 'id': postId },
  //           {
  //             $set: {
  //               oldImageUrl: imageUrl,
  //               imageUrl: `https://oemdieselparts.com/pic/${imagesplit}`,
  //               hasWatermark: true,
  //               cardsimageold: imageUrl2,
  //               cardsimage: `https://oemdieselparts.com/pic/${imagesplit}`
  //             }
  //           }
  //         );
  //       } else {

  //         await axios.put(url, payload, { headers })
  //           .then(response => console.log(response.data, 'SUCCESS'))
  //           .catch(error => console.error(error.response.data.errors[0].details, 'ERR'));
  //         const ReplaceStatussave = new ReplaceStatus({ id: postId, oldImageUrl: imageUrl, imageUrl: `https://oemdieselparts.com/pic/${imagesplit}`, hasWatermark: true, cardsimageold: imageUrl2, cardsimage: `https://oemdieselparts.com/pic/${imagesplit}`, DocumentType: "page" })
  //         await ReplaceStatussave.save()

  //         console.log("hello");
  //       }
  //     } else {
  //       await axios.put(url, payload, { headers })
  //         .then(response => console.log(response.data, 'SUCCESS'))
  //         .catch(error => console.error(error.response.data.errors[0].details, 'ERR'));
  //       console.log("sahi h");
  //       await ReplaceStatus.findOneAndUpdate(
  //         { 'id': postId },
  //         {
  //           $set: {
  //             oldImageUrl: imageUrl,
  //             imageUrl: `https://oemdieselparts.com/pic/${imagesplit}`,
  //             hasWatermark: true,
  //             DocumentType: "page"
  //           }
  //         }
  //       );
  //       console.log("nhi");
  //     }

  //   };

  //   checkFields();

  //   res.status(200).json({ message: 'Post updated successfully', imagePath });
  //   if (fs.existsSync(pngPath)) {
  //     fs.unlinkSync(pngPath);
  //   }
  // } catch (error) {
  //   console.error(error);
  //   isFunctionRunning = 0;
  //   res.status(500).json({ message: "Internal server error" });
  // }
};

