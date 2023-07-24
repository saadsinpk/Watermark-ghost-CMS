import mongoose from "mongoose";


const imageSchemawa = new mongoose.Schema({
    id: {
        type: String,
    },
    watermark: {
        type: String,
    },
    alignment: {
        type: String,
    },
    watermarktype: {
        type: String,
    },
    watermarktypeenable: {
        type: String,
    },
    userID: {
        type: String,
    },
    imagewatermark: {
        type: String,
    },
    offsetx: {
        type: String,
    },
    offsety: {
        type: String,
    },
    opacity: {
        type: String,
    },
    widthscale: {
        type: String,
    }

}, { timestamps: true });

const watermark = mongoose.model('watermark', imageSchemawa);

export default watermark;
