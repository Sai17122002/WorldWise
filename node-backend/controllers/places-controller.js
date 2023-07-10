const uuid = require("uuid");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../Util/location");
const mongoose = require("mongoose");
const Place = require("../models/place");
const User = require("../models/user");
const fs = require("fs");

const HttpError = require("../models/http-error");
const place = require("../models/place");

// let DUMMY_PLACES = [
//   {
//     id: "p1",
//     title: "Empire State Building",
//     description: "One of the most famous sky scrapers in the world!",
//     location: {
//       lat: 40.7484474,
//       lng: -73.9871516,
//     },
//     address: "20 W 34th St, New York, NY 10001",
//     creator: "u1",
//   },
// ];

//Get place by id
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError("Something went wrong.", 500));
  }

  if (!place) {
    // throw new HttpError("Could not find a place for the provided id.", 404);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

//Get place by creator id
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    // return next(
    //   new HttpError("Could not find places for the provided user id.", 404)
    // );
  }

  if (!places || places.length === 0) {
    // return next(
    //   new HttpError("Could not find places for the provided user id.", 404)
    // );
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

//Create new place
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { title, description, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (err) {
    return next(err);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator,
  });

  //Point to the user with id=creator
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("Failed to create place", 500));
  }

  if (!user)
    return next(new HttpError("User cannot be created for the id", 404));

  try {
    //To add new place and update corresponding user at the same time
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Failed to create place", 500));
  }
  res.status(201).json({ place: createdPlace });
};

//Update place
const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

//Delete place
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }
  if (!place) throw new HttpError("Could not find place for that id", 404);

  const imagePath = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    //from place collection we are pointing to the user collection(place.creator is the user collection now, all these were possible because of populate)
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }
  fs.unlink(imagePath, function (err) {
    console.log(err);
  });
  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
