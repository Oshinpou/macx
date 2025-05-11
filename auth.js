const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const users = gun.get('macx_users');

const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const recoverForm = document.getElementById('recoverForm');

// Utility: Show message
function showMessage(message, success = false) {
  const msg = document.createElement('p');
  msg.textContent = message;
  msg.style.color = success ? 'green' : 'red';
  msg.style.marginTop = '0.5rem';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}

// Async function to check if email is already used
function isEmailUsed(email) {
  return new Promise((resolve) => {
    let found = false;

    // Iterate over all users to find if the email already exists
    users.map().once((user) => {
      // If email already exists, return true
      if (user && user.email === email) {
        found = true;
        resolve(true);
      }
    });

    // If no email found, resolve false
    setTimeout(() => {
      if (!found) resolve(false);
    }, 1500); // Add timeout for waiting for map() to complete
  });
}

// SIGNUP
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();

    if (!username || !email || !password) return showMessage("All signup fields required");

    // Check if the username exists first
    users.get(username).once(async (data) => {
      if (data && data.username) {
        return showMessage("Username already exists");
      }

      // Check for email duplication using the async function
      const emailTaken = await isEmailUsed(email);
      if (emailTaken) return showMessage("Email already used");

      // If no duplication, create the user
      users.get(username).put({ username, email, password }, (ack) => {
        if (ack.err) return showMessage("Signup failed, try again");
        showMessage("Signup successful!", true);
      });
    });
  });
}

// LOGIN
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) return showMessage("All login fields required");

    users.get(username).once((data) => {
      if (!data || !data.password) return showMessage("Account does not exist");
      if (data.password !== password) return showMessage("Incorrect password");

      localStorage.setItem('macx_loggedInUser', username);
      showMessage("Login successful!", true);
      setTimeout(() => window.location.href = "home.html", 1500);
    });
  });
}

// RECOVER
if (recoverForm) {
  recoverForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('recoverUsername').value.trim();
    const email = document.getElementById('recoverEmail').value.trim();

    if (!username || !email) return showMessage("All recovery fields required");

    users.get(username).once((data) => {
      if (!data) return showMessage("Username not found");
      if (data.email !== email) return showMessage("Email does not match");

      showMessage(`Recovered Password: ${data.password}`, true);
    });
  });
}

// HOME PAGE check
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
