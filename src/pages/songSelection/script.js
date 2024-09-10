require("dotenv").config();

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const encodedCredentials = btoa(`${clientID}:${clientSecret}`);

let currentPage = 1;
const tracksPerPage = 100;

let accessToken = null;
let refreshToken = null;

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search__input");
  const songElement = document.getElementById("song");

  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      currentPage = 1;
      searchForSong(searchInput.value);
    }
  });

  for (let i = 0; i < songElement.length; i++) {
    songElement[i].addEventListener("click", function () {
      const songId = songElement[i].dataset.id;
      const songTitle = songElement[i].dataset.name;
      const songArtist = songElement[i].dataset.artist;
      const songImage = songElement[i].dataset.picture;

      const songDetails = new URLSearchParams({
        id: songId,
        name: songTitle,
        artist: songArtist,
        image: songImage,
      });

      const trackImage = document.createElement("img");
      if (songImage) {
        trackImage.src = songImage;
      } else {
        trackImage.src = "https://via.placeholder.com/50";
      }
      trackImage.alt = songTitle;
      window.location.href =
        "/src/pages/checkoutWhite/index.html?" + songDetails.toString();
    });
  }

  fetchTopTracks();
});

function fetchTopTracks() {
  if (!accessToken) {
    return;
  }
  fetch("https://api.spotify.com/v1/playlists/37i9dQZF1DXcBWIGoYBM5M/tracks", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch tracks. Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      displayTracks(
        data.items.map((item) => item.track),
        "song__list"
      );
    })
    .catch((error) => console.error("Error:", error));
}

function searchForSong(searchTerm) {
  if (!accessToken) {
    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(clientID + ":" + clientSecret),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        accessToken = data.access_token;
        searchWithAccessToken(searchTerm);
      })
      .catch((error) => console.error("Error:", error));
  } else {
    searchWithAccessToken(searchTerm);
  }
}

function searchWithAccessToken(searchTerm) {
  fetch(`https://api.spotify.com/v1/search?q=${searchTerm}&type=track`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displayTracks(data.tracks.items, "song__list");
    })
    .catch((error) => console.error("Error:", error));
}

function displayTracks(tracks, containerId) {
  if (!Array.isArray(tracks)) {
    console.error("Invalid tracks data:", tracks);
    return;
  }
  const songList = document.getElementById(containerId);
  songList.innerHTML = "";
  const start = (currentPage - 1) * tracksPerPage;
  const end = start + tracksPerPage;

  tracks.slice(start, end).forEach((track) => {
    const songElement = document.createElement("div");
    songElement.classList.add("song");

    const songImage = document.createElement("img");
    songImage.src = track.album.images[0]?.url || "";
    songImage.alt = track.picture;

    const songInfo = document.createElement("div");
    songInfo.classList.add("song-info");

    const songTitle = document.createElement("p");
    songTitle.classList.add("song-title");
    songTitle.textContent = track.name;

    const songArtist = document.createElement("p");
    songArtist.classList.add("artist");
    songArtist.textContent = track.artists
      .map((artist) => artist.name)
      .join(", ");

    songInfo.appendChild(songTitle);
    songInfo.appendChild(songArtist);
    songInfo.appendChild(songImage);
    songElement.appendChild(songImage);
    songElement.appendChild(songInfo);

    songElement.addEventListener("click", function () {
      console.log("Click event listener triggered");
      console.log("Song clicked, id:", track.id);

      queueSong(track.id);

      const title = encodeURIComponent(track.name);
      const artist = encodeURIComponent(
        track.artists.map((artist) => artist.name).join(", ")
      );
      const cover = encodeURIComponent(track.album.images[0]?.url || "");

      window.location.href = `/src/pages/checkoutWhite/index.html?title=${title}&artist=${artist}&cover=${cover}`;
    });
    songList.appendChild(songElement);
  });
}

function goToPage(page) {
  currentPage = page;
  searchForSong(document.getElementById("search__input").value);
}

function queueSong(trackId, songTitle, artist) {
  console.log("queueSong function triggered");
  console.log("queueSong called, trackId:", trackId);

  fetch(
    "https://api.spotify.com/v1/me/player/queue?uri=spotify:track:" + trackId,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        if (response.status === 401) {
          return refreshToken(refreshToken).then((newAccessToken) => {
            accessToken = newAccessToken;
            return queueSong(trackId, songTitle, artist);
          });
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      return response.json();
    })
    .then((json) => {
      console.log(json);

      var encodedSongTitle = encodeURIComponent(songTitle);
      var encodedArtist = encodeURIComponent(artist);

      window.location.href =
        "/src/pages/checkoutWhite/index.html?songTitle=" +
        encodedSongTitle +
        "&artist=" +
        encodedArtist;
    })
    .catch((e) => console.log("There was an error: ", e));
}

function authenticateWithSpotify() {
  let clientId = "d4dbf4ba983749c69428b3aec1b434c3";
  let redirectUri = encodeURIComponent(
    "http://127.0.0.1:5500/src/pages/songSelection/index.html"
  );
  let scopes = encodeURIComponent(
    "user-read-private user-read-email user-modify-playback-state"
  );

  window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
}

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code) {
    let body = new URLSearchParams();
    body.append("grant_type", "authorization_code");
    body.append("code", code);
    body.append(
      "redirect_uri",
      "http://127.0.0.1:5500/src/pages/songSelection/index.html"
    );

    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(clientID + ":" + clientSecret),
      },
      body: body,
    })
      .then((response) => response.json())
      .then((data) => {
        accessToken = data.access_token;
        refreshToken = data.refresh_token;
        fetchTopTracks();
      });
  } else {
    authenticateWithSpotify();
  }
};
