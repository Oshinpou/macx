// Connect to a public GUN relay for global storage
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const users = gun.get('macx_users');

// Elements for various forms
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const recoverForm = document.getElementById('recoverForm');
const deleteAccountForm = document.getElementById('deleteAccountForm');

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

  if (!username || !email || !password) return showMessage("All signup fields are required");

  // Check if username exists
  users.get(username).once((data) => {
    if (data) return showMessage("Username already exists");

    // Check if email is already used
    users.map().once((user) => {
      if (user?.email === email) return showMessage("Email already used");
    });

    // Proceed to sign up
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

  if (!username || !password) return showMessage("All login fields are required");

  // Check if username exists and password matches
  users.get(username).once((data) => {
    if (!data) return showMessage("Account does not exist");
    if (data.password !== password) return showMessage("Incorrect password");

    // Login successful, save username to localStorage and redirect
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

  if (!username || !email) return showMessage("All recovery fields are required");

  // Check if username exists
  users.get(username).once((data) => {
    if (!data) return showMessage("Username not found");
    if (data.email !== email) return showMessage("Email does not match");

    // Display recovered password
    showMessage(`Recovered Password: ${data.password}`, true);
  });
});

// DELETE ACCOUNT
deleteAccountForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('deleteUsername').value.trim();
  const email = document.getElementById('deleteEmail').value.trim();
  const password = document.getElementById('deletePassword').value.trim();
  const confirmUsername = document.getElementById('deleteConfirmUsername').value.trim();
  const confirmText = document.getElementById('deleteConfirmText').value.trim();

  if (!username || !email || !password || !confirmUsername || !confirmText) {
    return showMessage("All fields are required");
  }

  if (confirmUsername !== username) {
    return showMessage("Username confirmation does not match");
  }

  if (confirmText !== "DELETE ACCOUNT") {
    return showMessage("You must type 'DELETE ACCOUNT' to confirm");
  }

  // Check if the user exists and the password is correct
  users.get(username).once((data) => {
    if (!data) return showMessage("Account does not exist");
    if (data.password !== password) return showMessage("Incorrect password");

    // Delete the account
    users.get(username).put(null, (ack) => {
      if (ack.err) return showMessage("Account deletion failed, try again");
      showMessage("Account deleted successfully", true);
      
      // Log the user out and redirect
      localStorage.removeItem('macx_loggedInUser');
      setTimeout(() => window.location.href = "index.html", 1500);
    });
  });
});

// Check if the user is already logged in on page load
window.addEventListener('load', () => {
  const loggedInUser = localStorage.getItem('macx_loggedInUser');
  if (loggedInUser) {
    document.getElementById('message').textContent = `Welcome, ${loggedInUser}`;
    // Optionally, redirect to homepage or user profile page
    // window.location.href = "home.html"; 
  }
});

// LOGOUT Functionality
function logout() {
  localStorage.removeItem('macx_loggedInUser');
  window.location.href = "index.html"; // Redirect to login page
}
