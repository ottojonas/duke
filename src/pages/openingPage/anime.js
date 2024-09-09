window.onload = function () {
  const reloaded = localStorage.getItem("reloaded");

  if (!reloaded) {
    localStorage.setItem("reloaded", "true");
    window.location.reload(true);
  } else {
    localStorage.removeItem("reloaded");
  }
};
