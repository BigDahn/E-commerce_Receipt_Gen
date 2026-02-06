const signJwt = require("./signjwt");

module.exports = (res, statusCode, user) => {
  const token = signJwt(user);

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 + 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("jwt", token, cookieOption);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token: token,
    data: {
      user,
    },
  });
};
