let views = ["intro01", "songSelection"];
let currentViewIndex = 0;

// Function to change viewing page
function changeView() {
  let currentView = document.getElementById(views[currentViewIndex]);
  currentView.style.display = "none";

  // Show next view
  currentViewIndex = (currentViewIndex + 1) % views.length;
  let nextView = document.getElementById(views[currentViewIndex]);
  nextView.style.display = "block";
}

// Listener event added to body
document.body.addEventListener("click", changeView);
