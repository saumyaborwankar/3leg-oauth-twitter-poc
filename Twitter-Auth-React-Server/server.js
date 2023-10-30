require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const oauth = require("oauth");
const universalAppKey = "";
const universalAppSecret = "";
const consumer = new oauth.OAuth(
  "https://twitter.com/oauth/request_token",
  "https://twitter.com/oauth/access_token",
  universalAppKey,
  universalAppSecret,
  "1.0A",
  "http://127.0.0.1:3000/auth-page",
  "HMAC-SHA1"
);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/start-auth", (req, res) => {
  console.log("start-auth");
  consumer.getOAuthRequestToken(function (
    error,
    oauthRequestToken,
    oauthRequestTokenSecret,
    results
  ) {
    if (error) {
      console.log(error);
      res
        .status(500)
        .send({ error: "Error getting OAuth request token : " + error });
    } else {
      console.log("s oauthRequestToken " + oauthRequestToken);
      console.log("s oauthRequestTokenSecret " + oauthRequestTokenSecret);

      res.status(200).send({
        redirectUrl:
          "https://twitter.com/oauth/authorize?oauth_token=" +
          oauthRequestToken,
        oauthRequestToken: oauthRequestToken,
        oauthRequestTokenSecret: oauthRequestTokenSecret,
      });
    }
  });
});

app.get(
  "/callback/:oauthRequestToken/:oauthRequestTokenSecret/:oauth_verifier",
  (req, res) => {
    console.log("callback");
    console.log("e oauthRequestToken " + req.params.oauthRequestToken);
    console.log(
      "e oauthRequestTokenSecret " + req.params.oauthRequestTokenSecret
    );
    console.log("oauth_verifier " + req.params.oauth_verifier);

    consumer.getOAuthAccessToken(
      req.params.oauthRequestToken,
      req.params.oauthRequestTokenSecret,
      req.params.oauth_verifier,
      function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
        console.log("function get access token");
        if (error) {
          res.status(500).send({
            error:
              "Error getting OAuth access token : " +
              error +
              "[" +
              oauthAccessToken +
              "]" +
              "[" +
              oauthAccessTokenSecret +
              "]" +
              "[" +
              results +
              "]",
          });
        } else {
          console.log("else");
          console.log(oauthAccessToken, oauthAccessTokenSecret);
          res.status(200).send({
            oauthAccessToken: oauthAccessToken,
            oauthAccessTokenSecret: oauthAccessTokenSecret,
          });
        }
      }
    );
  }
);

app.get("/verify/:oauthAccessToken/:oauthAccessTokenSecret", (req, res) => {
  console.log("verify");
  consumer.get(
    "https://api.twitter.com/1.1/account/verify_credentials.json",
    req.params.oauthAccessToken,
    req.params.oauthAccessTokenSecret,
    function (error, data, response) {
      if (error) {
        console.log(error);
        res.status(500).send({ error: "authentication error" });
      } else {
        const parsedData = JSON.parse(data);
        res.status(200).send({ user: parsedData });
      }
    }
  );
});

app.listen(process.env.PORT || 8080, () => {
  console.log("listening at port 8080");
});
module.exports = app;
