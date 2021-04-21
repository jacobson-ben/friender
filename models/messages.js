"use strict";

/** Message class for message.ly */

const { NotFoundError } = require("../expressError");
const db = require("../db");

/** Message on the site. */

class Message {

  /** Register new message -- returns
   *    {id, from_username, to_username, body, sent_at}
   */

