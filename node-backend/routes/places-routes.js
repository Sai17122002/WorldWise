const express = require('express');

const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.use(checkAuth);

router.post(
  '/',
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
