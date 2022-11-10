"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  if (!res.locals.user) throw new UnauthorizedError();
  return next();
}

/** Middleware to use when they must be logged in and user MUST be admin.
 */

function ensureIsAdmin(req, res, next) {

  if (!res.locals.user || res.locals.user.isAdmin !== true) {
    throw new UnauthorizedError();
  }
  return next();
}

/** Middleware to use when they must be logged in and either an admin or the
 * current user.
 */

function ensureIsCorrectUserOrAdmin(req, res, next) {
  const username = req.params.username;

  if (!res.locals.user) {
    throw new UnauthorizedError();
  }

  if (!(res.locals.user.isAdmin === true || res.locals.user.username === username)) {
    throw new UnauthorizedError();
  }

  return next();
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
  ensureIsCorrectUserOrAdmin
};
