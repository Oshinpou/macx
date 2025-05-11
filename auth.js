const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const users = gun.get('macx_users');
const emails = gun.get('macx_emails'); // New node to track unique emails

// ELEMENT SELECTORS
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const recoverForm = document.getElementById('recoverForm');
const deleteAccountForm = document.getElementById('deleteAccountForm');

// UTILITIES
function showMessage(msg, ok = false) {
  const el = document.createElement('p');
  el.textContent = msg;
  el.style.color = ok ? 'green' : 'red';
  el.style.marginTop = '1rem';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

// SIGNUP
signupForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value.trim();

  if (!username || !email || !password) return showMessage("All fields required");

  // Check if username exists
  users.get(username).once((data) => {
    if (data) return showMessage("Username already exists");

    // Check if email exists
    emails.get(email).once((emailUsed) => {
      if (emailUsed) return showMessage("Email already used");

      // Proceed with account creation
      users.get(username).put({ username, email, password }, (ack) => {
        if (ack.err) return showMessage("Signup failed");
        emails.get(email).put(username); // Link email to username
        localStorage.setItem('macx_loggedInUser', username);
        showMessage("Signup successful!", true);
        setTimeout(() => window.location.href = "home.html", 1500);
      });
    });
  });
});

// LOGIN
loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!username || !password) return showMessage("Enter all login info");

  users.get(username).once((data) => {
    if (!data) return showMessage("User not found");
    if (data.password !== password) return showMessage("Wrong password");
    localStorage.setItem('macx_loggedInUser', username);
    showMessage("Login successful!", true);
    setTimeout(() => window.location.href = "home.html", 1500);
  });
});

// RECOVER
recoverForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('recoverUsername').value.trim();
  const email = document.getElementById('recoverEmail').value.trim().toLowerCase();

  if (!username || !email) return showMessage("All fields required");

  users.get(username).once((data) => {
    if (!data) return showMessage("Username not found");
    if (data.email !== email) return showMessage("Email mismatch");
    showMessage(`Your password: ${data.password}`, true);
  });
});

// DELETE ACCOUNT
deleteAccountForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('deleteUsername').value.trim();
  const email = document.getElementById('deleteEmail').value.trim().toLowerCase();
  const password = document.getElementById('deletePassword').value.trim();
  const confirmUser = document.getElementById('deleteConfirmUsername').value.trim();
  const confirmText = document.getElementById('deleteConfirmText').value.trim();

  if (!username || !email || !password || !confirmUser || !confirmText) {
    return showMessage("All fields are required");
  }

  if (confirmUser !== username) return showMessage("Confirmation username mismatch");
  if (confirmText !== "DELETE ACCOUNT") return showMessage("Type DELETE ACCOUNT to confirm");

  users.get(username).once((data) => {
    if (!data) return showMessage("Account doesn't exist");
    if (data.password !== password) return showMessage("Password mismatch");

    // Delete account from users and remove email from email list
    users.get(username).put(null);
    emails.get(email).put(null);
    localStorage.removeItem('macx_loggedInUser');
    showMessage("Account permanently deleted", true);
    setTimeout(() => window.location.href = "index.html", 2000);
  });
});

// AUTO LOGIN
window.addEventListener('load', () => {
  const user = localStorage.getItem('macx_loggedInUser');
  if (user) {
    document.getElementById('message')?.textContent = `Welcome, ${user}`;
    // Optional: redirect
    // window.location.href = "home.html";
  }
});

// LOGOUT
function logout() {
  localStorage.removeItem('macx_loggedInUser');
  window.location.href = "index.html";
                        }
