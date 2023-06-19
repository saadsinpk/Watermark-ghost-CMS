import mongoose from "mongoose";


const imageSchemawa = new mongoose.Schema({
    id: {
        type: String,
    },
    watermark: {
        type: String,
    },
}, { timestamps: true });

const watermark = mongoose.model('watermark', imageSchemawa);

export default watermark;
