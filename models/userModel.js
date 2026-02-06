const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please Provide an email"],
      lowercase: true,
      unique: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Password does not match",
      },
    },
    passwordChangedDate: {
      type: Date,
      select: false,
    },
    role: {
      type: String,
      enum: ["owner", "customer"],
      default: "customer",
    },
    business: Array,
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre("save", function (next) {
  if (this.isNew || !this.isModified("password")) return next();

  this.passwordChangedDate = Date.now() - 1000;

  next();
});

userSchema.methods.ComparePassword = async function (password1, password2) {
  return await bcrypt.compare(password1, password2);
};

userSchema.methods.changedPasswordAfter = function (jwt_timeStamp) {
  if (this.passwordChangedDate) {
    const passwordTimeStamp = parseInt(
      this.passwordChangedDate.getTime() / 1000,
      10
    );

    return jwt_timeStamp < passwordTimeStamp;
  }

  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
