// import mongoose from 'mongoose'

// const imageSchema = new mongoose.Schema({
//     id: {
//         type: String,
//     },
//     oldImageUrl: {
//         type: String,
//     },
//     imageUrl: {
//         type: String,
//         required: true
//     },
//     hasWatermark: {
//         type: Boolean,
//         default: false
//     },
//     cardsimageold: {
//         type: String,
//     },
//     cardsimage: {
//         type: String,
//     },
//     Watermark: {
//         type: String,
//         default: 'watermark',
//     },
//     DocumentType: {
//         type: String,
//         default: 'post',
//     }
// }, { timestamps: true });

// const ReplaceStatus = mongoose.model('ReplaceStatus', imageSchema);

// export default ReplaceStatus;
import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    feature_imageold: {
        type: String,
    },
    feature_image: {
        type: String,
        required: true
    },
    hasWatermark: {
        type: Boolean,
        default: false
    },
    Watermark: {
        type: String,
        default: 'watermark',
    },
    AuthEmail: {
        type: String,
        default: '',
    },
    DocumentType: {
        type: String,
        default: 'post',
    }
}, { timestamps: true });

const ReplaceStatus = mongoose.model('ReplaceStatus', imageSchema);

export default ReplaceStatus;