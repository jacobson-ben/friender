"use strict";

const Router = require("express").Router;
const router = new Router();

const { client } = require("../config");
const Message = require("../models/message");
const User = require("../models/user");
const { UnauthorizedError } = require("../expressError");

const db = require("../db");
const {
  ensureLoggedIn,
  authenticateJWT,
  ensureCorrectUser,
  ensureCorrectUserOrAdmin,
} = require("../middleware/auth");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  const message = await Message.get(req.params.id);
  const toUser = message.to_user.username;
  const fromUser = message.from_user.username;
  if (
    res.locals.user.username === toUser ||
    res.locals.user.username === fromUser
  ) {
    return res.json({ message });
  }
  throw new UnauthorizedError();
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureCorrectUserOrAdmin, async function (req, res, next) {
  const user = await User.get(res.locals.user.username);

  if (!user.matches.includes(req.body.to_username)) {
    throw new UnauthorizedError("User not in matches.");
  }

  const message = await Message.create(req.body);

  return res.json({ message });
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post(
  "/:id/read",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    const message = await Message.get(req.params.id);
    const toUser = message.to_user.username;
    if (res.locals.user.username === toUser) {
      const markRead = await Message.markRead(req.params.id);
      return res.json({ markRead });
    }
    throw new UnauthorizedError();
  }
);

module.exports = router;
