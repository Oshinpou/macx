// Connect to a public GUN relay for global storage
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const users = gun.get('macx_users');

// Elements
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

// SIGNUP
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();

  if (!username || !email || !password) return showMessage("All signup fields required");

  users.get(username).once((data) => {
    if (data) return showMessage("Username already exists");

    // Check for duplicate email
    users.map().once((user) => {
      if (user?.email === email) return showMessage("Email already used");
    });

    users.get(username).put({ username, email, password }, (ack) => {
      if (ack.err) return showMessage("Signup failed, try again");
      showMessage("Signup successful!", true);
    });
  });
});

// LOGIN
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  users.get(username).once((data) => {
    if (!data) return showMessage("Account does not exist");
    if (data.password !== password) return showMessage("Incorrect password");

    localStorage.setItem('macx_loggedInUser', username);
    showMessage("Login successful!", true);
    setTimeout(() => window.location.href = "home.html", 1500);
  });
});

// RECOVER PASSWORD
recoverForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('recoverUsername').value.trim();
  const email = document.getElementById('recoverEmail').value.trim();

  users.get(username).once((data) => {
    if (!data) return showMessage("Username not found");
    if (data.email !== email) return showMessage("Email does not match");

    showMessage(`Recovered Password: ${data.password}`, true);
  });
});
