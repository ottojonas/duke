const clientID = "d4dbf4ba983749c69428b3aec1b434c3";
const clientSecret = "9e66393aba6c4978aa82e7f8b801e99f";

const accessToken = "PLACEHOLDER_ACCESS_TOKEN";

async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new Error("Refresh token missing");
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
        grant_type: "refreshToken",
        refresh_token: refreshToken,
      }),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `HTTP error, status: ${response.status}, Body: ${errorBody}`
      );
    }
    const data = await response.json();
    let accessToken = data.access_token;
    if (data.error) {
      const errorMessage = `${data.error}:${data.error_description}`;
      console.error("error refreshing token:", errorMessage);
    }
  } catch (error) {
    console.error("an error occured", error.message);
  }
}

function updateCheckoutPage(
  songTitle,
  artist,
  trackId,
  accessToken,
  refreshToken
) {
  let songTitleElement = document.getElementById("song-name");
  let artistElement = document.getElementById("artist");
  let albumCoverElement = document.getElementById("album-cover");

  if (songTitleElement) {
    songTitleElement.textContent = songTitle;
  } else {
    console.error("song-name element could not be found");
  }

  if (artistElement) {
    artistElement.textContent = artist;
  } else {
    console.error("artist element could not be found");
  }

  if (albumCoverElement) {
    albumCoverElement.src = albumCover;
  } else {
    console.error("album-cover element could not be found");
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
          const newAccessToken = await refreshAccessToken;
          return updateCheckoutPage(
            songTitle,
            artist,
            trackId,
            accessToken,
            refreshToken
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
        console.error("response data", data);
      }
    })
    .catch((error) => {
      console.error("failed to fetch album cover", error);
    });
}

async function fetchAlbumCover(albumId, accessToken) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
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

async function fetchCurrentPlaybackInfo(accessToken) {
  const response = await fetch("https://api.spotify.com/v1/me/player", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("failed to fetch current playback info");
  }
  return response.json();
}

async function calculateTimeUntilSelectedSong(
  accessToken,
  selectedSongQueuePosition
) {
  try {
    const playbackInfo = await fetchCurrentPlaybackInfo(accessToken);
    if (!playbackInfo.is_playing) {
      console.log("noting is currently playing");
      return;
    }
    const currentSongDurationMs = playbackInfo.item.duration_ms;
    const currentPlaybackPositionMs = playbackInfo.progress_ms;
    const timeLeftCurrentSongMs =
      currentSongDurationMs - currentPlaybackPositionMs;

    // placeholder = calculate total duration of songs ahead in queue until selected songs
    let totalDurationUntilSelectedSongMs = timeLeftCurrentSongMs;
    // Add duration of each song in queue up to selected song
    for (let i = 0; i < selectedSongQueuePosition - 1; i++) {
      totalDurationUntilSelectedSongMs += durationEachSongInQueue[i];
    }

    console.log(
      `time until selected song: ${
        totalDurationUntilSelectedSongMs / 1000 / 60
      } minutes`
    );
  } catch (error) {
    console.error(error);
  }
}

window.onload = function () {
  // ensure page has been reloaded when first opened to load new content
  if (!localStorage.getItem("pageReloaded")) {
    localStorage.setItem("pageReloaded", "true");
    window.location.reload();
    return;
  } else {
    localStorage.removeItem("pageReloaded");
  }
  // end of page reload

  var params = new URLSearchParams(window.location.search);
  var songTitle = decodeURIComponent(params.get("title"));
  var artist = decodeURIComponent(params.get("artist"));
  var albumCover = decodeURIComponent(params.get("cover"));
  var trackId = decodeURIComponent(params.get("trackId"));
  var accessToken = decodeURIComponent(params.get("accessToken"));
  var refreshToken = decodeURIComponent(params.get("refreshToken"));
  var songNameElement = document.getElementById("song-name");
  var artistElement = document.getElementById("artist");
  var albumCoverElement = document.getElementById("album-cover");
  if (!songTitle || songTitle === "null") {
    console.error("song title not fetched");
    songTitle = "N/A";
  }

  if (!artist || artist === "null") {
    console.error("artist was not fetched");
    artist = "N/A";
  }

  if (!songNameElement) {
    console.error("song-name element could not be found");
    setTimeout(function () {
      var songNameElementRetry = document.getElementById("song-name");
      if (songNameElementRetry) {
        songNameElementRetry.textContent = songTitle;
      } else {
        console.error("song-name element could not be found after delay");
      }
    }, 1000);
    return;
  }

  if (artistElement) {
    artistElement.textContent = artist;
  } else {
    console.error("artist element could not be found");
  }

  if (!artistElement) {
    console.error("artist element could not be found");
    setTimeout(function () {
      var artistElementRetry = document.getElementById("artist");
      if (artistElementRetry) {
        artistElement.textContent = artist;
      } else {
        console.error("artist element could not be found after delay");
      }
    }, 1000);
    return;
  }

  if (albumCoverElement) {
    albumCoverElement.src = albumCover;
  } else {
    console.error("album-cover element could not be found");
  }

  if (!albumCoverElement) {
    console.error("album element could not be found");
    setTimeout(function () {
      var albumCoverElementRetry = documenyt.getElementById("album");
      if (albumCoverElementRetry) {
        albumCoverElement.src = album;
      } else {
        console.error("could not find album element after delay");
      }
    }, 1000);
  }
  updateCheckoutPage(songTitle, artist, trackId, accessToken, refreshToken);
};

const selectedSongQueuePosition = 0;
calculateTimeUntilSelectedSong(accessToken, selectedSongQueuePosition);
