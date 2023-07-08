
import express from 'express';
import mongoose from 'mongoose';
// import passport from 'passport';
// import session from 'express-session';
// import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import allimage from './routes/allimage.js'
import userRoutes from "./routes/usersRoutes.js";
import testRoutes from "./routes/Test.js";
import Imagerouter from "./routes/images.js";
import cookieParser from 'cookie-parser';
import getImage from './routes/getImage.js';
// import create from './routes/postCreate.js';
import Update1 from './routes/postUpdate.js';
import delete1 from './routes/delete.js';
// import page1 from './routes/createpage.js';
import UpdatePag from './routes/updatepage.js';
import pageDelete12 from './routes/pagedelete.js';
import DynamicImage from './routes/DynamicImage.js';
import test from './models/test.js';
import watermark1 from './models/watermark.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
// import fs from 'fs';


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
app.use('/api/detail', testRoutes)
app.use('/api/imgUpload', Imagerouter)
app.use('/api/get', getImage)
app.use('/api', Update1)
app.use('/api', delete1)
app.use('/api', UpdatePag)
app.use('/api', pageDelete12)
app.use('/api/getImage', DynamicImage)




// app.use(express.urlencoded({ extended: false }));
// app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
// app.use(passport.initialize());
// app.use(passport.session());






const users = [
    { id: 1, username: 'john', password: 'password' },
    { id: 2, username: 'jane', password: 'password' },
];


// passport.use(
//     new LocalStrategy((username, password, done) => {
//         const user = users.find((user) => user.username === username && user.password === password);
//         if (user) {
//             return done(null, user);
//         }
//         return done(null, false);
//     })
// );

// passport.serializeUser((user, done) => {
//     done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//     const user = users.find((user) => user.id === id);
//     done(null, user);
// });


// app.post('/register', (req, res) => {
//     const { username, password } = req.body;


//     const existingUser = users.find((user) => user.username === username);
//     if (existingUser) {
//         return res.status(400).json({ message: 'Username already taken' });
//     }


//     const newUser = {
//         id: users.length + 1,
//         username: username,
//         password: password,
//     };


//     users.push(newUser);


//     res.status(200).json({ message: 'Registration successful' });
// });

// app.post('/test', (req, res) => {
//     res.send(users);
//     console.log(req.body);
// });

app.use(express.static(path.join(__dirname, 'public')));

app.get('/changewatermark', async (req, res) => {
    const change = await watermark1.findOne({ id: "648ab1684855601a64bcdf5d" });
    res.send(change)
});
app.get('/watermark', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/watermark.html'));
});
app.get('/image/:imageName', (req, res) => {
    const imageName = req.params.imageName; // Get the image name from the URL parameter

    // Replace 'image.jpg' with the actual image file name and extension
    // const imagePath = path.join(__dirname, `/path2/${imageName}`);
    res.send('imagePath');

});
app.post('/changewatermark', async (req, res) => {
    try {
        const { deg, imagestyle, imagewatermark, watermarktype, style, watermark, id } = req.body;
        const change = await watermark1.findOne({ id });
        if (watermark) {
            change.watermark = watermark;
        }
        else if (style) {
            change.style = style;
        }
        else if (watermarktype) {
            change.watermarktype = watermarktype;
        }
        else if (imagewatermark) {
            change.imagewatermark = imagewatermark;
        }
        else if (imagestyle) {
            change.imagestyle = imagestyle;
        }
        else if (deg) {
            change.deg = deg;
        }
        console.log(watermark || watermarktype || style || deg ? deg : style, "watermark");
        await change.save();
        res.status(200).send(change.watermark);
    } catch (err) {
        res.status(400).send(err);
        console.log(err);
    }
});

app.post('/login', async (req, res, next) => {
    const expiresInMinutes = 1; // Expiration time in minutes
    const expirationTimestamp = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
    // console.log(req.body, "saad");
    const { username, password } = req.body;
    try {
        const user = await test.findOne({ 'member.current.email': username });
        if (!user) {
            return next(createError(404, "User not found!"));
        }

        const userPassword = user.member.current.password;
        if (userPassword === password) {
            const token = jwt.sign({ 'username': username, "password": password }, process.env.JWT_SECRET, { expiresIn: expirationTimestamp });
            res.status(200).json({ token, user });
            // res.send("access_token", token, {
            //   httpOnly: true,

            // }).status(200).json(user);
            // res.status(200).send(user);
        } else {
            return next(createError(400, "Wrong Credentials!"));
        }
    } catch (err) {
        next(err);
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        req.user = user;
        next();
    });
}

app.get('/protected-endpoint', authenticateToken, (req, res) => {

    // Access the authenticated user data
    const user = req.user;
    // console.log(user);

    // Perform operations on the protected endpoint
    // ...

    res.send('Success'); // Return a response indicating success
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

// app.post('/passlogin', passport.authenticate('local', { successRedirect: '/loginfun', failureRedirect: '/login' }));


const port = 3000;
app.listen(port, () => {
    connectDB()
    console.log(`Server is running on http://localhost:${port}`);
});
