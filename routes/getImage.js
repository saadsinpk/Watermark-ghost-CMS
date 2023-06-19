
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const app = express();

const imagesFolderPath = './public/uploads'; // Update the path to the images folder

router.get('/images', (req, res) => {
    fs.readdir(imagesFolderPath, (err, files) => {
        if (err) {
            console.error('Error reading images folder:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const imagePaths = files.map((file) => `./uploads/${file}`);

        res.json({ images: imagePaths });
    });
});

export default router;