import express from "express";
import fetch from "node-fetch";
const app = express();

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = encodeURIComponent("http://localhost:3000/callback");
const scopes = encodeURIComponent(
  "playlist-modify-public playlist-modify-private streaming"
);

app.get("/login", (req, res) => {
  const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;
  res.redirect(url);
});

app.get("/callback", (req, res) => {
  const code = req.query.code;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const body = `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`;
  fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body,
  })
    .then((response) => response.json())
    .then((data) => {
      res.send(data); // send the access and refresh tokens to the client
    });
});

app.listen(3000, () => console.log("App is listening on port 3000"));
