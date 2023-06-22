import mongoose from "mongoose";


const imageSchemawa = new mongoose.Schema({
    id: {
        type: String,
    },
    watermark: {
        type: String,
    },
    style: {
        type: String,
    },
    watermarktype: {
        type: String,
    },
    imagewatermark: {
        type: String,
    },
    deg: {
        type: String,
    },
    imagestyle: {
        type: String,
    }

}, { timestamps: true });

const watermark = mongoose.model('watermark', imageSchemawa);

export default watermark;
