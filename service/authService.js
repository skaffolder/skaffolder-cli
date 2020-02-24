const properties = require("../properties");
const request = require("../utils/request");
const md5 = require("md5");

exports.login = function(mail, password, cb) {
  request(
    {
      url: properties.endpoint + "/cli/login",
      method: "GET",
      public: true,
      headers: {
        user: mail,
        pass: md5(password)
      }
    },
    function(error, body) {
      cb(error, body);
    }
  );
};
