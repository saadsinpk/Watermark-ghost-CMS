import mongoose from "mongoose";


const imageMain = new mongoose.Schema({
  feature_image: String,
});

const Imagemain = mongoose.model('Image_post_page', imageMain);

export default Imagemain;
