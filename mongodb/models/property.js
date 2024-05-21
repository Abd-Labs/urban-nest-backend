const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Title is required'] },
    description: { type: String, required: [true, 'Description is required'] },
    PropertyType: { type: String, required: [true, 'Property type is required'] },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    photos: [{ type: String, required: [true, 'At least one photo is required'] }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }, // Automatically set to the current timestamp
    location: { type: String, required: [true, 'Location is required'] } // Add the location field
});

const PropertyModel = mongoose.model('Property', PropertySchema);

module.exports = PropertyModel;
