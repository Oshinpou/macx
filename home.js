document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("macx_loggedInUser");
  const userDisplay = document.getElementById("userDisplay");
  const notLoggedIn = document.getElementById("notLoggedIn");
  const loggedInSection = document.getElementById("loggedInSection");
  const logoutBtn = document.getElementById("logoutBtn");

  if (username) {
    userDisplay.textContent = `Welcome, ${username}`;
    loggedInSection.style.display = "block";
    notLoggedIn.style.display = "none";
  } else {
    loggedInSection.style.display = "none";
    notLoggedIn.style.display = "block";
  }

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("macx_loggedInUser");
    window.location.reload();
  });
});
