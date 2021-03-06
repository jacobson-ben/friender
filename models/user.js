"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT username,
                    password,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    is_admin AS "isAdmin"
             FROM users
             WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, age, bio interests, imageUrl, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({
    username,
    password,
    firstName,
    lastName,
    email,
    age,
    bio,
    interests,
    imageUrl,
    location,
    radius,
    isAdmin,
  }) {
    const duplicateCheck = await db.query(
      `SELECT username
         FROM users
         WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
         (username,
          password,
          first_name,
          last_name,
          email,
          age,
          bio,
          interests,
          image_url,
          location,
          radius,
          is_admin)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING username, first_name AS "firstName", last_name AS "lastName", email, age, bio, interests, image_url AS "imageUrl", location, radius, is_admin AS "isAdmin"`,
      [
        username,
        hashedPassword,
        firstName,
        lastName,
        email,
        age,
        bio,
        interests,
        imageUrl,
        location,
        radius,
        isAdmin,
      ]
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT username,
                first_name AS "firstName",
                last_name AS "lastName",
                email,
                age,
                bio,
                interests,
                image_url AS "imageUrl", 
                location,
                radius,         
                is_admin AS "isAdmin"
         FROM users
         ORDER BY username`
    );

    return result.rows;
  }
  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *   where jobs is { id, title, company_handle, company_name, state }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
      `SELECT 
        username,
        first_name AS "firstName",
        last_name AS "lastName",
        email,
        age,
        bio,
        interests,
        image_url AS "imageUrl", 
        location,
        radius,         
        is_admin AS "isAdmin"
      FROM users
      WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    //user dislikes
    const dislikedRes = await db.query(
      `SELECT disliked
           FROM dislikes
           WHERE disliker = $1`,
      [username]
    );

    user.dislikes = dislikedRes.rows.map((d) => d.disliked);

    //user likes
    const userLikesRes = await db.query(
      `SELECT liked
           FROM likes
           WHERE liker = $1`,
      [username]
    );

    user.likes = userLikesRes.rows.map((l) => l.liked);

    const userMatchesFirst = await db.query(
      `SELECT username_first
        FROM matches
        WHERE username_second = $1`,
      [username]
    );

    const userMatchesSecond = await db.query(
      `SELECT username_second
        FROM matches
        WHERE username_first = $1`,
      [username]
    );

    const matchesUserInFirstColumn = userMatchesFirst.rows.map(
      (m) => m.username_first
    );
    const matchesUserInSecondColumn = userMatchesSecond.rows.map(
      (m) => m.username_second
    );
    user.matches = matchesUserInFirstColumn.concat(matchesUserInSecondColumn);

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      imageUrl: "image_url",
      isAdmin: "is_admin",
    });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                age,
                                bio,
                                interests,
                                image_url AS "imageUrl",
                                location,
                                radius,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
      `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  /** Like a user
   *
   * - username: username applying for job
   **/

  static async likeAUser(username, likedUsername) {
    //check to make sure user who is liking exists in db.
    const preCheck = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [username]
    );
    const likedUser = preCheck.rows[0];

    if (!likedUser) throw new NotFoundError(`No user found: ${likedUsername}`);

    //check to make sure user who is liked exists in db.
    const preCheck2 = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [likedUsername]
    );
    const user = preCheck2.rows[0];

    if (!user) throw new NotFoundError(`No username: ${username}`);

    //an array of usernames that the user "liked"
    const results = await db.query(
      `INSERT INTO likes (liker, liked)
           VALUES ($1, $2)
            RETURNING liker, liked`,
      [username, likedUsername]
    );

    return results.rows[0];
  }

  static async dislikeAUser(username, dislikedUsername) {
    //check to make sure user who is disliking exists in db.
    const preCheck = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [username]
    );
    const dislikedUser = preCheck.rows[0];

    if (!dislikedUser)
      throw new NotFoundError(`No user found: ${dislikedUsername}`);

    //check to make sure user who is disliked exists in db.
    const preCheck2 = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [dislikedUsername]
    );
    const user = preCheck2.rows[0];

    if (!user) throw new NotFoundError(`No username: ${username}`);

    //an array of usernames that the user "disliked"
    const results = await db.query(
      `INSERT INTO dislikes (disliker, disliked)
           VALUES ($1, $2)
            RETURNING disliker, disliked`,
      [username, dislikedUsername]
    );

    return results.rows[0];
  }

  static async addUserToMatches(username, likedUsername) {
    const result = await db.query(
      `INSERT INTO matches(username_first, username_second)
      VALUES ($1, $2)
      RETURNING username_first username_second`,
      [username, likedUsername]
    );
    return result.rows[0];
  }
}

module.exports = User;
