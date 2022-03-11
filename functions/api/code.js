import qs from "query-string";
import jwt from "@tsndr/cloudflare-worker-jwt";
export const myVerySecretString = "gfddfshgfhd65345234bvcfdgsfsd";

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    console.log(body);
    const token = await exchangeCodeForToken(body.code);
    const user = await fetchUser(token);
    const jwtencoded = await encodeJWT(user, myVerySecretString);

    await env.KV_github_keys.put(`${user.id}`, JSON.stringify({user,token}));

    console.log(jwtencoded);
  } catch (error) {
    console.log(error);
  }
}

const config = {
  CLIENT_ID: "d00bdb1af84c4faef82c",
  CLIENT_SECRET: "5735f21e979685a52a7de10e30c936c661b565a5",
  REDIRECT_URL: "http://localhost:8788/",
  AUTHORIZATION_ENDPOINT: "https://github.com/login/oauth/authorize",
  TOKEN_ENDPOINT: "https://github.com/login/oauth/access_token",
  RESOURCE_ENDPOINT: "https://api.github.com/",
};

async function exchangeCodeForToken(code) {
  const TokenURL = config.TOKEN_ENDPOINT;
  const OAuthQueryParams = {
    grant_type: "authorization_code",
    redirect_url: config.REDIRECT_URL,
    client_id: config.CLIENT_ID,
    client_secret: config.CLIENT_SECRET,
    code: code,
  };
  const res = await fetch(TokenURL, {
    body: JSON.stringify(OAuthQueryParams),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.text();
  const parsedData = qs.parse(data);
  console.log(parsedData);
  return parsedData.access_token;
}

async function fetchUser(token) {
  const userURL = config.RESOURCE_ENDPOINT + "user";
  const res = await fetch(userURL, {
    headers: {
      Authorization: `token ${token}`,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
    },
  });

  const data = await res.json();
  console.log(data);
  return data;
}

async function encodeJWT(user, token) {
  const jwtPayload = {
    login: user.login,
    id: user.id,
    avatar_url: user.avatar_url,
  };

  return jwt.sign(jwtPayload, token);
}
