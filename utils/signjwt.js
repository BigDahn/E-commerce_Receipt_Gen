const jwt = require("jsonwebtoken");

module.exports = (data) => {
  return jwt.sign({ data }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
