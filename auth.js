// Connect to GUN
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const users = gun.get('macx_users');

// Forms
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const recoverForm = document.getElementById('recoverForm');

// Show message
function showMessage(message, success = false) {
  const msg = document.createElement('p');
  msg.textContent = message;
  msg.style.color = success ? 'green' : 'red';
  msg.style.marginTop = '0.5rem';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}

// SIGNUP
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();

    if (!username || !email || !password) return showMessage("All fields required");

    users.get(username).once((data) => {
      if (data && data.username) return showMessage("Username already exists");

      // Check email duplication
      let emailExists = false;
      let checked = false;

      users.map().once((user) => {
        if (!checked && user && user.email === email) {
          emailExists = true;
          checked = true;
          showMessage("Email already used");
        }
      });

      setTimeout(() => {
        if (emailExists) return;

        // Save user
        users.get(username).put({ username, email, password }, (ack) => {
          if (ack.err) return showMessage("Signup failed");
          showMessage("Signup successful!", true);
        });
      }, 1000);
    });
  });
}

// LOGIN
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) return showMessage("All fields required");

    users.get(username).once((data) => {
      if (!data || !data.password) return showMessage("Account does not exist");
      if (data.password !== password) return showMessage("Incorrect password");

      // Save login
      localStorage.setItem('macx_loggedInUser', username);
      showMessage("Login successful!", true);
      setTimeout(() => window.location.href = "home.html", 1500);
    });
  });
}

// RECOVER PASSWORD
if (recoverForm) {
  recoverForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('recoverUsername').value.trim();
    const email = document.getElementById('recoverEmail').value.trim();

    if (!username || !email) return showMessage("All fields required");

    users.get(username).once((data) => {
      if (!data) return showMessage("Username not found");
      if (data.email !== email) return showMessage("Email does not match");

      showMessage(`Recovered Password: ${data.password}`, true);
    });
  });
}

// HOME PAGE: Display user
if (window.location.pathname.includes("home.html")) {
  const userDisplay = document.getElementById("userDisplay");
  const logoutBtn = document.getElementById("logoutBtn");

  const loggedInUser = localStorage.getItem('macx_loggedInUser');
  if (!loggedInUser) {
    window.location.href = "index.html";
  } else {
    userDisplay.textContent = `Welcome, ${loggedInUser}`;
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem('macx_loggedInUser');
    window.location.href = "index.html";
  });
}
