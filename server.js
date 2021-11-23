const express = require("express");
const bodyParser = require("body-parser");
const OAuthServer = require("oauth2-server");
const memorystore = require("./model");
const path = require("path");

const app = express();

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

const oauth = new OAuthServer({
  model: memorystore,
  grants: [
    "authorization_code",
    "password",
    "refresh_token",
    "client_credentials",
  ],
  accessTokenLifetime: 4 * 60 * 60, //4 hours
});

app.post("/oauth/token", (request, response, next) => {
  console.log("route", "/oauth/token");
  let newRequest = new OAuthServer.Request(request);
  let newResponse = new OAuthServer.Response(response);
  oauth
    .token(newRequest, newResponse)
    .then((token) => {
      console.log("response", JSON.stringify(token));
      const newToken = {
        "access_token": token.accessToken,
        "expires_in": token.accessTokenExpiresAt,
        "token_type": "Bearer"
      };
      return response.json(newToken);
    })
    .catch((error) => {
      console.error("error", error);
      return response.status(500).json(error);
    });
});

app.listen(app.get("port"), function () {
  console.log("Express server listening on port:", app.get("port"));
});
