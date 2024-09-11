require("dotenv").config();

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new Error("Refresh token is missing");
  }

  const auth = btoa(`${clientID}:${clientSecret}`);

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `HTTP error, status: ${response.status}, Body: ${errorBody}`,
      );
    }

    const data = await response.json();
    let accessToken = data.access_token;
    if (data.error) {
      const errorMessage = `${data.error}: ${data.error_description}`;
      console.error("Error refreshing token:", errorMessage);
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

async function fetchAlbumCover(albumId, accessToken) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error, status: ${response.status}`);
    }

    const data = await response.json();
    return data.images[0].url;
  } catch (error) {
    console.error("Failed to fetch album cover:", error.message);
  }
}

function updateCheckoutPage(
  songTitle,
  artist,
  trackId,
  accessToken,
  refreshToken,
) {
  let songTitleElement = document.getElementById("song-name");
  let artistElement = document.getElementById("artist");
  let albumCoverElement = document.getElementById("album-cover");

  if (songTitleElement) {
    songTitleElement.textContent = songTitle;
  } else {
    console.error("Element with id 'song-name' was not found");
  }

  if (artistElement) {
    artistElement.textContent = artist;
  } else {
    console.error("Element with id 'artist' was not found");
  }

  if (albumCoverElement) {
    albumCoverElement.src = albumCover;
  } else {
    console.error("Element with id 'album-cover' was not found");
  }

  fetch("https://api.spotify.com/v1/tracks/" + trackId, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        if (response.status === 401) {
          const newAccessToken = await refreshAccessToken(refreshToken);
          accessToken = newAccessToken;
          return updateCheckoutPage(
            songTitle,
            artist,
            trackId,
            accessToken,
            refreshToken,
          );
        } else {
          throw new Error("HTTP error " + response.status);
        }
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.album && data.album.images && data.album.images[0]) {
        var albumCover = data.album.images[0].url;
        document.getElementById("album-cover").src = albumCover;
      } else {
        console.error("Unexpected response data", data);
      }
    })
    .catch((error) => {
      console.error("Failed to fetch album cover", error);
    });
}

window.onload = function () {
  if (!localStorage.getItem("pageReloaded")) {
    localStorage.setItem("pageReloaded", "true");
    window.location.reload();
    return;
  } else {
    localStorage.removeItem("pageReloaded");
  }

  var params = new URLSearchParams(window.location.search);
  var songTitle = decodeURIComponent(params.get("title"));
  var artist = decodeURIComponent(params.get("artist"));
  var albumCover = decodeURIComponent(params.get("cover"));

  if (!songTitle || songTitle === "null") {
    console.error("Song title is null or not provided");
    songTitle = "Error collecting song name";
  }

  var songNameElement = document.getElementById("song-name");
  if (!songNameElement) {
    console.error(
      "Element with ID 'song-name' not found. Delaying the update.",
    );
    setTimeout(function () {
      var songNameElementRetry = document.getElementById("song-name");
      if (songNameElementRetry) {
        songNameElementRetry.textContent = songTitle;
      } else {
        console.error(
          "Element with ID 'song-name' still not found after delay.",
        );
      }
    }, 1000);
    return;
  }
  var artistElement = document.getElementById("artist");
  var albumCoverElement = document.getElementById("album-cover");

  if (songNameElement) {
    songNameElement.textContent = songTitle;
  } else {
    console.error("Element with ID 'song-name' not found.");
  }

  if (artistElement) {
    artistElement.textContent = artist;
  } else {
    console.error("Element with ID 'artist' not found.");
  }

  if (albumCoverElement) {
    albumCoverElement.src = albumCover;
  } else {
    console.error("Element with ID 'album-cover' not found.");
  }

  var trackId = decodeURIComponent(params.get("trackId"));
  var accessToken = decodeURIComponent(params.get("accessToken"));
  var refreshToken = decodeURIComponent(params.get("refreshToken"));
  updateCheckoutPage(songTitle, artist, trackId, accessToken, refreshToken);
};

async function fetchCurrentPlaybackInfo(accessToken) {
  const response = await fetch("https://api.spotify.com/v1/me/player", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch current playback info");
  }

  const data = await response.json();
  return data;
}

const accessToken = "ACCESS_TOKEN_PLACEHOLDER"; // Replace with actual accessToken

async function fetchCurrentPlaybackInfo(accessToken) {
  const response = await fetch("https://api.spotify.com/v1/me/player", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch current playback info");
  }
  return response.json();
}

async function calculateTimeUntilSelectedSong(
  accessToken,
  selectedSongPositionInQueue,
) {
  try {
    const playbackInfo = await fetchCurrentPlaybackInfo(accessToken);
    if (!playbackInfo.is_playing) {
      console.log("Nothing is currently playing");
      return;
    }
    const currentSongDurationMs = playbackInfo.item.duration_ms;
    const currentPlaybackPositionMs = playbackInfo.progress_ms;
    const timeLeftForCurrentSongMs =
      currentSongDurationMs - currentPlaybackPositionMs;

    // Placeholder: Calculate total duration of songs ahead in the queue until the selected song
    let totalDurationUntilSelectedSongMs = timeLeftForCurrentSongMs; // Start with time left for current song
    // Add duration of each song in the queue up to the selected song
    for (let i = 0; i < selectedSongPositionInQueue - 1; i++) {
      totalDurationUntilSelectedSongMs += durationOfEachSongInQueue[i];
    }

    console.log(
      `Time until selected song: ${
        totalDurationUntilSelectedSongMs / 1000 / 60
      } minutes`,
    );
  } catch (error) {
    console.error(error);
  }
}

const selectedSongPositionInQueue = 0; // Example / placeholder for testing
calculateTimeUntilSelectedSong(accessToken, selectedSongPositionInQueue);
