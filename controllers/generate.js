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


const key =
  "5f9a86ae980832579ebe5e17:c2704ca585b2084347903b9f8aff6f47a13e034440391c41dbc1139f128cc25b";

const [id, secret] = key.split(":");

const token = jwt.sign({}, Buffer.from(secret, "hex"), {
  keyid: id,
  algorithm: "HS256",
  expiresIn: "10y",
  audience: "/admin/",
});

export const Allimage = async (req, res, next) => {
  const apiUrl = 'https://oemdieselparts.com/ghost/api/content/posts/?key=62ba5f4d0ae64abf8445ee2054';
  let allPosts = [];
  let isFunctionRunning = false;

  const fetchPage = async (page) => {
    const url = `${apiUrl}&page=${page}`;

    try {
      const response = await axios.get(url);
      const data = response.data;
      const posts = data.posts;

      for (const post of posts) {
        const postId = post.id;
        const url1 = `https://oemdieselparts.com/ghost/api/admin/posts/${postId}`;
        const headers = {
          Authorization: `Ghost ${token}`,
        };

        try {
          const response1 = await axios.get(url1, { headers });
          const responseData = response1.data;
          if (responseData) {
            responseData.posts.forEach(async (innerpost) => {
              console.log("postId");
              console.log(post.id);
              console.log(innerpost.id);
              console.log("end postId");
              const processedData = processPostData(innerpost);
              await Update(processedData);
              await new Promise(resolve => setTimeout(resolve, 1000));
            });
          }
        } catch (error) {
          console.error("error");
        }
      }

    } catch (error) {
      console.error("error");
      res.status(500).send('Error processing images.');
    }

  };

  fetchPage(1);
}
// New function to process the post data
function processPostData(postData) {
  // Extract the fields you need from the postData object
  const postId = postData.id;
  const mobiledoc = JSON.parse(postData.mobiledoc);
  const featureImage = postData.feature_image;
  const updated_at = postData.updated_at;
  const title = postData.title;

  // Create an object with the extracted data
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
  };

  return processedData;
}