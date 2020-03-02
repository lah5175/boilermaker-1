const crypto = require("crypto");
const Sequelize = require("sequelize");
const db = require("../db");
const _ = require("lodash");

const User = db.define(
  "user",
  {
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      // Making `.password` act like a func hides it when serializing to JSON.
      // This is a hack to get around Sequelize's lack of a "private" option.
      get() {
        return () => this.getDataValue("password");
      }
    },
    salt: {
      type: Sequelize.STRING,
      // Making `.salt` act like a function hides it when serializing to JSON.
      // This is a hack to get around Sequelize's lack of a "private" option.
      get() {
        return () => this.getDataValue("salt");
      }
    },
    googleId: {
      type: Sequelize.STRING
    }
  },
  {
    hooks: {
      beforeCreate: setSaltAndPassword,
      beforeUpdate: setSaltAndPassword
    }
  }
);

// instance methods
User.prototype.correctPassword = function(candidatePassword) {
  return (
    User.encryptPassword(candidatePassword, this.salt()) === this.password()
  );
};

User.prototype.sanitize = function() {
  return _.omit(this.toJSON(), ["password", "salt"]);
};

// class methods
User.generateSalt = function() {
  return crypto.randomBytes(16).toString("base64");
};

User.encryptPassword = function(plainText, salt) {
  const hash = crypto.createHash("sha1");
  hash.update(plainText);
  hash.update(salt);
  return hash.digest("hex");
};

function setSaltAndPassword(user) {
  if (user.changed("password")) {
    user.salt = User.generateSalt();
    user.password = User.encryptPassword(user.password(), user.salt());
  }
}

module.exports = User;
