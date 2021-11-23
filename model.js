const jwt = require("jsonwebtoken");

var model = module.exports;

const SignatureAlgorithmToken = "HS256";
const SignatureToken = "AKIAIAGA5VV23TFLS5VA";

// In-memory datastores:
var oauthAccessTokens = [],
  oauthRefreshTokens = [],
  oauthClients = [
    {
      clientId: "elazaro",
      clientSecret: "Belcorp2021",
      redirectUri: "",
      grants: [
        "authorization_code",
        "password",
        "refresh_token",
        "client_credentials",
      ],
      scope: "scopeDefault"
    },
  ],
  users = [
    {
      id: "123",
      username: "elazaro",
      password: "Belcorp2021",
      scope: "scopeDefault",
    },
  ];

// Debug function to dump the state of the data stores
model.dump = function () {
  console.log("oauthAccessTokens", oauthAccessTokens);
  console.log("oauthClients", oauthClients);
  console.log("oauthRefreshTokens", oauthRefreshTokens);
  console.log("users", users);
};

model.getAccessToken = function (accessToken, callback) {
  console.log("model function", "getAccessToken");
  console.log("accessToken", accessToken);
  for (var i = 0, len = oauthAccessTokens.length; i < len; i++) {
    var elem = oauthAccessTokens[i];
    if (elem.token.accessToken === accessToken) {
      console.log("getAccessToken", "Ok");
      return callback(false, elem);
    }
  }
  callback(false, false);
};

model.getRefreshToken = function (refreshToken, callback) {
  console.log("model function", "getRefreshToken");
  console.log("refreshToken", refreshToken);
  for (var i = 0, len = oauthRefreshTokens.length; i < len; i++) {
    var elem = oauthRefreshTokens[i];
    if (elem.refreshToken === refreshToken) {
      console.log("getRefreshToken", "Ok");
      return callback(false, elem);
    }
  }
  callback(false, false);
};

model.getClient = function (clientId, clientSecret, callback) {
  console.log("model function", "getClient");
  console.log("clientId", clientId);
  console.log("clientSecret", clientSecret);
  for (var i = 0, len = oauthClients.length; i < len; i++) {
    var elem = oauthClients[i];
    if (elem.clientId === clientId && elem.clientSecret === clientSecret) {
      console.log("getClient", "Ok");
      return callback(false, elem);
    }
  }
  callback(false, false);
};

model.getUserFromClient = function (client, callback) {
  console.log("model function", "getUserFromClient");
  console.log("client", JSON.stringify(client));
  for (var i = 0, len = users.length; i < len; i++) {
    var elem = users[i];
    if (
      elem.username === client.clientId &&
      elem.password === client.clientSecret
    ) {
      console.log("getUserFromClient", "Ok");
      return callback(false, elem);
    }
  }
  callback(false, false);
};

model.saveToken = function (token, client, user, callback) {
  console.log("model function", "saveToken");
  console.log("token", JSON.stringify(token));
  console.log("client", JSON.stringify(client));
  console.log("user", JSON.stringify(user));

  oauthAccessTokens.unshift({
    token: token,
    client: client,
    user: user,
  });

  const newToken = {
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    client: client.clientId,
    user: user.id,
    scope: user.scope,
  };
  console.log("newToken", JSON.stringify(newToken));
  console.log("saveToken", "Ok");
  callback(false, newToken);
};

model.getUser = function (username, password, callback) {
  console.log("model function", "getUser");
  console.log("username", username);
  console.log("password", password);
  for (var i = 0, len = users.length; i < len; i++) {
    var elem = users[i];
    if (elem.username === username && elem.password === password) {
      console.log("getUser", "Ok");
      return callback(false, elem);
    }
  }
  callback(false, false);
};

model.validateScope = function (user, client, scope) {
  console.log("model function", "validateScope");
  if (!scope) scope = "scopeDefault";
  console.log("user", JSON.stringify(user));
  console.log("client", JSON.stringify(client));
  console.log("scope", scope);
  let requestedScopes = scope.split(" ");
  let authorizedScopes = client.scope ? client.scope.split(" ") : [];
  let userScopes = user.scope ? user.scope.split(" ") : [];
  let result = requestedScopes.every((s) => authorizedScopes.indexOf(s) >= 0);
  if (result === true) {
    result = requestedScopes.every((s) => userScopes.indexOf(s) >= 0);
  }
  return result;
};

model.verifyScope = function (token, scope) {
  console.log("model function", "verifyScope");
  console.log("token", token);
  console.log("scope", scope);
  if (!token.scope) {
    return false;
  }
  let requestedScopes = scope.split(" ");
  let authorizedScopes = token.scope.split(" ");
  return requestedScopes.every((s) => authorizedScopes.indexOf(s) >= 0);
};

model.generateAccessToken = function (client, user, scope) {
  return generateToken(client, user, scope, 60 * 60 * 24); // 1h
};

model.generateRefreshToken = function (client, user, scope) {
  return generateToken(client, user, scope, 60 * 60 * 24 * 7); //1 week
};

model.generateAuthorizationCode = function (client, user, scope) {
  return generateToken(client, user, scope, 60 * 60 * 24); // 1h
};

function generateToken(client, user, scope, duration) {
  let algorithm = SignatureAlgorithmToken;
  let private_key = SignatureToken;
  let token = jwt.sign(
    { 
        id: user.id,
        usr: user.username,
        sc: scope
    },
    private_key,
    {
      expiresIn: duration,
      algorithm: algorithm,
    }
  );
  return token;
}
