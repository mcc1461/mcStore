"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
// passwordEncrypt(password:string):

const { pbkdf2Sync } = require("crypto"),
  keyCode = process.env.SECRET_KEY,
  loopCount = 1000,
  charCount = 32,
  encType = "sha512";

module.exports = function (password) {
  return pbkdf2Sync(password, keyCode, loopCount, charCount, encType).toString(
    "hex"
  );
};
