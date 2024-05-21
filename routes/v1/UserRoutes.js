const express = require('express');

const {  getAllUsers , getUserByID } = require('../../Controllers/UserControllers');

const router = express.Router();

router.get('/', getAllUsers )
router.get('/:id', getUserByID);


module.exports = router;