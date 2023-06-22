import postCreate from "../models/Post.js";
import axios from "axios";
import IMAGE from "../models/image.js";
import stream from "stream";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import ReplaceStatus from "../models/replacepage.js";
import path from "path";
import fs from "fs";
import { json } from "stream/consumers";
import watermark from '../models/watermark.js'
import { Update } from "./PostUpdate.js";
import { Updatepage12 } from './Updatepage.js'
import fsx from 'fs-extra';


const key =
  "6492802eb312980350eae3cf:fb5fb378053efe19fd0b06e551cca071d3331b8d2f7cb638b5645c7c96c63e5f";

const [id, secret] = key.split(":");

const token = jwt.sign({}, Buffer.from(secret, "hex"), {
  keyid: id,
  algorithm: "HS256",
  expiresIn: "60m",
  audience: "/admin/",
});

export const Allimage = async (req, res, next) => {
  //   console.clear();
  //  setTimeout(function() {
  //   console.clear();
  // }, 2000);
  try {
    async function generate() {
      const apiUrl = 'https://oemdieselparts.com/ghost/api/content/posts/?key=62ba5f4d0ae64abf8445ee2054';
      let isFetchingComplete = false;

      const fetchPage = async (page) => {
        const url = `${apiUrl}&page=${page}`;
        console.log(url);
        try {
          const response = await axios.get(url);
          const data = response.data;
          const { posts, meta } = data;
          console.log(posts.length);
          const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

          for (const post of posts) {
            const postId = post.id;
            // console.log(postId);

            const url1 = `https://oemdieselparts.com/ghost/api/admin/posts/${postId}`;
            const headers = {
              Authorization: `Ghost ${token}`,
            };

            try {
              const response1 = await axios.get(url1, { headers });
              const responseData = response1.data;
              // console.log(responseData, "responseData");
              if (responseData) {
                for (const innerpost of responseData.posts) {
                  // console.log("Send postId" + post.id);
                  if (innerpost.primary_author.email == req.body.email) {
                    console.log(innerpost.primary_author.email, "------>");
                    const processedData = processPostData(innerpost);
                    try {
                      await Update(processedData);
                    } catch (error) {
                      console.error("An error occurred during the Update:", error);
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    console.log("end postId");
                    // authorized = true;
                    break;
                  } else {
                    console.log(innerpost.primary_author.email, "------>  1");
                  }
                }
              }
            } catch (error) {
              if (error.response && error.response.status === 401) {
                console.error("Test Unauthorized. Retrying in 3 minutes...");
                console.clear();
                await delay(180000);
              } else {
                console.error("Error:", error.response.statusText);
                break;
              }
            }

          }
          if (meta.pagination && meta.pagination.next && !isFetchingComplete) {
            await fetchPage(page + 1);

          } else {
            isFetchingComplete = true; // Set flag to indicate fetching is complete
            console.log("Fetching complete");
            res.send("complete") // Invoke the callback function
          }
        } catch (error) {
          console.error("Error retrieving data:", error);
        }

      };

      fetchPage(1);
    }
    generate();
    // async function generate1() {
    //   const apiUrl1 = 'https://oemdieselparts.com/ghost/api/content/pages/?key=62ba5f4d0ae64abf8445ee2054';
    //   let isFetchingComplete1 = false;

    //   function processPostData1(postData) {
    //     // Extract the fields you need from the postData object
    //     const postId = postData.id;
    //     const mobiledoc = JSON.parse(postData.mobiledoc);
    //     const featureImage = postData.feature_image;
    //     const updated_at = postData.updated_at;
    //     const title = postData.title;

    //     // Create an object with the extracted data
    //     const processedData = {
    //       body: {
    //         page: {
    //           current: {
    //             id: postId,
    //             updated_at: updated_at,
    //             title: title,
    //             mobiledoc: JSON.stringify(mobiledoc),
    //             feature_image: featureImage,
    //           },
    //         },
    //       },
    //       generate: "yes",
    //     };

    //     return processedData;
    //   }


    //   const fetchPage1 = async (page) => {
    //     const url = `${apiUrl1}&page=${page}`;
    //     console.log(url);
    //     try {
    //       const response = await axios.get(url);
    //       const data = response.data;
    //       const { pages, meta } = data;
    //       console.log(pages.length);


    //       for (const page of pages) {
    //         const postId = page.id;
    //         // console.log(postId, "SAAD");
    //         // console.log();
    //         const url1 = `https://oemdieselparts.com/ghost/api/admin/pages/${postId}`;
    //         const headers = {
    //           Authorization: `Ghost ${token}`,
    //         };

    //         try {
    //           const response1 = await axios.get(url1, { headers });
    //           const responseData = response1.data;
    //           if (responseData) {
    //             for (const innerpost of responseData.pages) {
    //               // console.log(innerpost);
    //               // console.log("Send postId" + post.id);
    //               const processedData = processPostData1(innerpost);
    //               try {
    //                 await Updatepage12(processedData);
    //               } catch (error) {
    //                 console.error("An error occurred during the Update:", error);
    //               }
    //               await new Promise(resolve => setTimeout(resolve, 1000));
    //               console.log("end postId");
    //               break;
    //             }
    //           }
    //         } catch (error) {
    //           console.error("error", error.response);
    //         }
    //       }

    //       if (meta.pagination && meta.pagination.next && !isFetchingComplete1) {
    //         await fetchPage1(page + 1);

    //       } else {
    //         isFetchingComplete1 = true; // Set flag to indicate fetching is complete
    //         console.log("Fetching complete");
    //         res.send("complete") // Invoke the callback function
    //       }
    //     } catch (error) {
    //       console.error("Error retrieving data:", error);
    //     }

    //   };

    //   fetchPage1(1);
    // }
    // generate1();

    console.log("Post Update webhook hit");
    // res.status(200).json({ message: "Webhook request received and processed successfully." });
  } catch (error) {

    console.error(error);


    res.status(500).json({ message: "An error occurred while processing the webhook." });
  }
}

function processPostData(postData) {

  const postId = postData.id;
  const mobiledoc = JSON.parse(postData.mobiledoc);
  const featureImage = postData.feature_image;
  const updated_at = postData.updated_at;
  const title = postData.title;


  const processedData = {
    body: {
      post: {
        current: {
          id: postId,
          updated_at: updated_at,
          title: title,
          mobiledoc: JSON.stringify(mobiledoc),
          feature_image: featureImage,
        },
      },
    },
    generate: "yes",
  };

  return processedData;
}

