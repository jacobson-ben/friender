"use strict";

/** Routes for likes. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin, ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Like = require("../models/likes");

const router = express.Router();

/** POST / { like }  => { liker, liked }
 *
 * Adds a new like. 
 *
 * This returns the username of the person who liked and the username of the person they liked.
 * like: {liker, liked}
 *
 * Authorization required: loggedIn
 **/

router.post("/", ensureLoggedIn, async function(req, res, next) {
  const like = await Like.post()
})

module.exports = router

