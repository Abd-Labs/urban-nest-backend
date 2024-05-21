const express = require("express");

const {
  getAllProperties,
  getPropertyDetail,
  createProperty,
  updateProperty,
  deleteProperty,
  upload
} = require("../../Controllers/PropertyControllers");

const router = express.Router();

router.get('/', getAllProperties);
router.get('/:id',getPropertyDetail);
router.post('/', upload.array('photos', 5), createProperty);
router.put('/:id',updateProperty);
router.delete('/:id',deleteProperty);

module.exports = router;
