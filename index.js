
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import allimage from './routes/allimage.js'
import userRoutes from "./routes/usersRoutes.js";
import Imagerouter from "./routes/images.js";
import cookieParser from 'cookie-parser';
import getImage from './routes/getImage.js';
import Update1 from './routes/postUpdate.js';
import delete1 from './routes/delete.js';
import getStaff from './routes/getStaff.js';
import generator from './routes/generator.js';
import getSingleStaff from './routes/getSingleStaff.js';
import addStaff from './routes/addStaff.js';
import deleteStaff from './routes/deleteStaff.js';
import updateStaff from './routes/updateStaff.js';
import UpdatePag from './routes/updatepage.js';
import pageDelete12 from './routes/pagedelete.js';
import DynamicImage from './routes/DynamicImage.js';
import staff from './models/staff.js';
import watermark1 from './models/watermark.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import cache from './cacheManager.js';

// const cache = fileCache.create({ life: 60 * 60 * 24 * 7 }); // cache expires after 7 days

const app = express();
app.use(cors())
dotenv.config()
const connectDB = () => {
    mongoose.connect(process.env.MONGO).then(() => {
        console.log("connectedtoDB")
    }).catch((err) => {
        throw err;
    })
}

app.use(cookieParser())
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use('/api', allimage)
app.use('/api/user', userRoutes)
app.use('/api/imgUpload', Imagerouter)
app.use('/api/get', getImage)
app.use('/api', Update1)
app.use('/api', delete1)
app.use('/api', getStaff)
app.use('/api', generator)
app.use('/api', getSingleStaff)
app.use('/api', addStaff)
app.use('/api', deleteStaff)
app.use('/api', updateStaff)
app.use('/api', UpdatePag)
app.use('/api', pageDelete12)
app.use('/api/getImage', DynamicImage)



app.use(express.static(path.join(__dirname, 'public')));

app.get('/changewatermark', async (req, res) => {
    const userId = req.query.user_id; // Assuming the parameter name is "userId" in the URL
    const change = await watermark1.findOne({ userID: userId });
    res.send(change);
});
app.get('/watermark', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/watermark.html'));
});
app.get('/image/:imageName', (req, res) => {
    const imageName = req.params.imageName; 
    res.send('imagePath');

});
app.post('/changewatermark', async (req, res) => {
    try {
        const { deg, alignment, imagewatermark, watermarktype, watermarktypeenable, offsetx, offsety, opacity, widthscale, watermark, id } = req.body;
        let change = await watermark1.findOne({ userID: id });
        if (!change) {
            change = new watermark1({ userID: id });
            change.watermark = '';
            change.alignment = '';
            change.watermarktype = 'image';
            change.watermarktypeenable = 'enable';
            change.imagewatermark = '';
            change.offsetx = '';
            change.offsety = '';
            change.opacity = '50';
            change.widthscale = '50';
        }
        if (watermark) {
            change.watermark = watermark;
        }
        if (alignment) {
            change.alignment = alignment;
        }
        if (watermarktype) {
            change.watermarktype = watermarktype;
        }
        if (watermarktypeenable) {
            change.watermarktypeenable = watermarktypeenable;
        }
        if (imagewatermark) {
            change.imagewatermark = imagewatermark;
        }
        if (offsetx) {
            change.offsetx = offsetx;
        }
        if (offsety) {
            change.offsety = offsety;
        }
        if (opacity) {
            change.opacity = opacity;
        }
        if (widthscale) {
            change.widthscale = widthscale;
        }

        await change.save();
        cache.clear();
        res.status(200).send(change.watermark);
    } catch (err) {
        res.status(400).send(err);
        console.log(err);
    }
});

app.post('/login', async (req, res, next) => {
    const expiresInMinutes = 1;
    const expirationTimestamp = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
    const { username, password } = req.body;
    try {
        const user = await staff.findOne({ 'member.current.email': username });
        if (!user) {
            return next(createError(404, "User not found!"));
        }

        const userPassword = user.member.current.password;
        if (userPassword === password) {
            const token = jwt.sign({ 'username': username, "password": password }, process.env.JWT_SECRET, { expiresIn: expirationTimestamp });
            res.status(200).json({ token, user });
        } else {
            return next(createError(400, "Wrong Credentials!"));
        }
    } catch (err) {
        next(err);
    }
});
app.post('/logout', (req, res) => {
  res.status(200).json({ message: "Logout successful" });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

app.get('/protected-endpoint', authenticateToken, (req, res) => {
  res.send('Success');
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "some thing went wrong!";
    return res.status(status).json({
        success: false,
        status,
        message,
    })
})

const port = 3000;
app.listen(port, () => {
    connectDB()
    console.log(`Server is running on http://localhost:${port}`);
});
