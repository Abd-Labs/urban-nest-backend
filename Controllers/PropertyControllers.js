    const Property = require("../mongodb/models/property");
    const User = require("../mongodb/models/user.js");
    const multer = require("multer");
      // Function to check if environment is production
    const isProduction = process.env.NODE_ENV === 'production';

    // Middleware function to handle file uploads with Multer
    const upload = isProduction ? null : multer({ dest: 'uploads/' });

    const path = require('path'); // Add this line
    const fs = require('fs');

    /**
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    
    const getAllProperties = async (req, res) => {
        try {
          // Pagination parameters
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 10;
          const skip = (page - 1) * limit;
      
          // Filtering parameters
          const filter = {};
      
          if (req.query.filter === 'recent') {
            // Sort by createdAt field in descending order (most recent first)
            const sortBy = { createdAt: -1 };
            const count = await Property.countDocuments(filter);
            const properties = await Property.find(filter)
              .sort(sortBy)
              .limit(limit)
              .skip(skip);
      
            res.status(200).json({ properties, totalPages: Math.ceil(count / limit), currentPage: page });
          } else if (req.query.filter === 'old') {
            // Sort by createdAt field in ascending order (least recent first)
            const sortBy = { createdAt: 1 };
            const count = await Property.countDocuments(filter);
            const properties = await Property.find(filter)
              .sort(sortBy)
              .limit(limit)
              .skip(skip);
      
            res.status(200).json({ properties, totalPages: Math.ceil(count / limit), currentPage: page });
          } else {
            // No filter specified, return all properties without filtering
            const count = await Property.countDocuments();
            const properties = await Property.find()
              .limit(limit)
              .skip(skip);
      
            res.status(200).json({ properties, totalPages: Math.ceil(count / limit), currentPage: page });
          }
        } catch (error) {
          console.error("Error fetching properties:", error);
          res.status(500).json({ message: "Internal server error" });
        }
      };
      
    


    const getPropertyDetail = async (req, res) => {
        const { id } = req.params;
        try {
            const property = await Property.findById(id);
            if (!property) {
                return res.status(404).json({ error: "Property not found" });
            }
            res.status(200).json({ ...property.toObject(), photos });
        } catch (error) {
            console.error("Error fetching property:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    };

    const updateProperty = async (req, res) => {
        const { id } = req.params;
        const session = await Property.startSession();
        session.startTransaction();
        try {
            const updatedProperty = await Property.findByIdAndUpdate(id, req.body, { new: true }).session(session);
            if (!updatedProperty) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ error: "Property not found" });
            }
            await session.commitTransaction();
            session.endSession();
            res.status(200).json(updatedProperty);
        } catch (error) {
            console.error("Error updating property:", error);
            await session.abortTransaction();
            session.endSession();
            if (error.name === 'CastError') {
                return res.status(400).json({ error: "Invalid property ID format" });
            }
            res.status(500).json({ message: "Internal server error" });
        }
    };


    const deleteProperty = async (req, res) => {
        const { id } = req.params;
        const session = await Property.startSession();
        session.startTransaction();
        try {
            // Find and delete the property
            const deletedProperty = await Property.findByIdAndDelete(id).session(session);
            if (!deletedProperty) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ error: "Property not found" });
            }
            // Delete the images associated with the property from the upload directory
            deletedProperty.photos.forEach(photo => {
                const imagePath = path.join(__dirname, '..', 'uploads', photo.split('/').pop());
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });


            // Find the user who owns the property
            const user = await User.findById(deletedProperty.creator).session(session);
            if (user) {
                // Remove the reference to the deleted property from the user's allProperties array
                user.allProperties.pull(deletedProperty._id);
                await user.save({ session });
            }
            
            await session.commitTransaction();
            session.endSession();
            res.status(200).json({ message: "Property deleted successfully" });
        } catch (error) {
            console.error("Error deleting property:", error);
            await session.abortTransaction();
            session.endSession();
            res.status(500).json({ message: "Internal server error" });
        }
    };


    const createProperty = async (req, res) => {
        const session = await Property.startSession();
        session.startTransaction();
        try {
            console.log(req.body)
            const { title, description, location, PropertyType, price } = req.body;
            const creator = req.user; // Assuming req.user_id is set by the middleware
            const photos = req.files.map((file) => `${req.protocol}://${req.get('host')}/${file.path}`);

            // Create a new property instance
            const newProperty = new Property({
                title,
                description,
                location,
                PropertyType,
                price,
                photos,
                creator,
            });

            // Save the property to the database
            await newProperty.save({ session });

            // Update the user document to associate the property
            await User.findByIdAndUpdate(creator, { $push: { allProperties: newProperty._id } }).session(session);
            // Commit the transaction if everything is successful
            await session.commitTransaction();
            session.endSession();

            res.status(201).json(newProperty); // Respond with the created property
        } catch (error) {
            // Rollback the transaction if any part of the process fails
            await session.abortTransaction();
            session.endSession();
            if (error.name === 'ValidationError') {
                // Handle validation errors
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ error: errors });
            }
            console.error("Error creating property:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    };

    module.exports = {
        getAllProperties,
        getPropertyDetail,
        createProperty,
        updateProperty,
        deleteProperty,
        upload,
    };
