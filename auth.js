const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const users = gun.get('macx_users');
const emails = gun.get('macx_emails'); // track all used emails for uniqueness

// UTIL
function showMessage(msg, success = false) {
  const el = document.createElement('p');
  el.textContent = msg;
  el.style.color = success ? 'green' : 'red';
  el.style.marginTop = '1rem';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

// SIGNUP
document.getElementById('signupForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value.trim();

  if (!username || !email || !password) return showMessage('All fields required');

  users.get(username).once((data) => {
    if (data) return showMessage('Username already taken');
    emails.get(email).once((emailUsed) => {
      if (emailUsed) return showMessage('Email already used');

      // Create account
      users.get(username).put({ username, email, password }, (ack) => {
        if (ack.err) return showMessage('Signup failed');
        emails.get(email).put(username); // Save email as used
        localStorage.setItem('macx_loggedInUser', username);
        showMessage('Signup successful!', true);
        setTimeout(() => (window.location.href = 'home.html'), 1000);
      });
    });
  });
});

// LOGIN
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!username || !password) return showMessage('All fields required');

  users.get(username).once((data) => {
    if (!data) return showMessage('User not found');
    if (data.password !== password) return showMessage('Incorrect password');
    localStorage.setItem('macx_loggedInUser', username);
    showMessage('Login successful', true);
    setTimeout(() => (window.location.href = 'home.html'), 1000);
  });
});

// RECOVER
document.getElementById('recoverForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('recoverUsername').value.trim();
  const email = document.getElementById('recoverEmail').value.trim().toLowerCase();

  if (!username || !email) return showMessage('All fields required');

  users.get(username).once((data) => {
    if (!data) return showMessage('User not found');
    if (data.email !== email) return showMessage('Email does not match');
    showMessage(`Recovered password: ${data.password}`, true);
  });
});

// DELETE
document.getElementById('deleteAccountForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('deleteUsername').value.trim();
  const email = document.getElementById('deleteEmail').value.trim().toLowerCase();
  const password = document.getElementById('deletePassword').value.trim();
  const confirmUsername = document.getElementById('deleteConfirmUsername').value.trim();
  const confirmText = document.getElementById('deleteConfirmText').value.trim();

  if (!username || !email || !password || !confirmUsername || !confirmText) {
    return showMessage('All fields are required');
  }

  if (confirmUsername !== username) return showMessage('Username confirmation failed');
  if (confirmText !== 'DELETE ACCOUNT') return showMessage('Type DELETE ACCOUNT to confirm');

  users.get(username).once((data) => {
    if (!data) return showMessage('Account not found');
    if (data.password !== password || data.email !== email) {
      return showMessage('Invalid credentials');
    }

    // Remove user + email reference
    users.get(username).put(null);
    emails.get(email).put(null);
    localStorage.removeItem('macx_loggedInUser');
    showMessage('Account deleted permanently', true);
    setTimeout(() => (window.location.href = 'index.html'), 2000);
  });
});

// AUTO-LOGIN on load
window.addEventListener('load', () => {
  const user = localStorage.getItem('macx_loggedInUser');
  if (user) {
    document.getElementById('message')?.textContent = `Welcome, ${user}`;
    // Optional auto redirect:
    // window.location.href = "home.html";
  }
});

// LOGOUT
function logout() {
  localStorage.removeItem('macx_loggedInUser');
  window.location.href = 'index.html';
}
