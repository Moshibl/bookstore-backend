import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  book: {type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true},
  rating: {type: Number, required: true, min: 1, max: 5},
  review: {type: String, required: true, maxlength: 500}
}, {timestamps: true});

export default reviewSchema;
