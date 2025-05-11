const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const users = gun.get('macx_users');
const emails = gun.get('macx_emails');

// Show feedback
function showMessage(msg, type = 'error') {
  const msgBox = document.getElementById('messageBox');
  if (msgBox) {
    msgBox.innerText = msg;
    msgBox.style.color = type === 'success' ? 'green' : 'red';
    msgBox.style.display = 'block';
  } else {
    alert(msg);
  }
}

// SIGNUP
document.getElementById('signupForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value.trim();

  if (!username || !email || !password) {
    return showMessage('All signup fields are required.');
  }

  users.get(username).once((data) => {
    if (data) return showMessage('Username already taken.');

    emails.get(email).once((used) => {
      if (used) return showMessage('Email already in use. Try logging in or use a new email.');

      users.get(username).put({ username, email, password }, (ack) => {
        if (ack.err) return showMessage('Signup failed. Try again later.');
        emails.get(email).put(username); // Mark email as used
        localStorage.setItem('macx_loggedInUser', username);
        showMessage('Signup successful!', 'success');
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

  if (!username || !password) return showMessage('Login fields cannot be empty.');

  users.get(username).once((data) => {
    if (!data) return showMessage('User not found.');
    if (data.password !== password) return showMessage('Incorrect password.');
    localStorage.setItem('macx_loggedInUser', username);
    showMessage('Login successful!', 'success');
    setTimeout(() => (window.location.href = 'home.html'), 1000);
  });
});

// RECOVER
document.getElementById('recoverForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('recoverUsername').value.trim();
  const email = document.getElementById('recoverEmail').value.trim().toLowerCase();

  if (!username || !email) return showMessage('Recovery fields required.');

  users.get(username).once((data) => {
    if (!data) return showMessage('No such user.');
    if (data.email !== email) return showMessage('Email does not match our records.');
    showMessage(`Recovered password: ${data.password}`, 'success');
  });
});

// DELETE
document.getElementById('deleteAccountForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('deleteUsername').value.trim();
  const email = document.getElementById('deleteEmail').value.trim().toLowerCase();
  const password = document.getElementById('deletePassword').value.trim();
  const confirmUser = document.getElementById('deleteConfirmUsername').value.trim();
  const confirmText = document.getElementById('deleteConfirmText').value.trim();

  if (!username || !email || !password || !confirmUser || !confirmText) {
    return showMessage('All delete fields must be filled.');
  }

  if (username !== confirmUser) return showMessage('Username confirmation does not match.');
  if (confirmText !== 'DELETE ACCOUNT') return showMessage('You must type DELETE ACCOUNT to confirm.');

  users.get(username).once((data) => {
    if (!data) return showMessage('User not found.');
    if (data.email !== email || data.password !== password) {
      return showMessage('Invalid credentials.');
    }

    users.get(username).put(null); // remove user
    emails.get(email).put(null);   // free the email
    localStorage.removeItem('macx_loggedInUser');
    showMessage('Account permanently deleted.', 'success');
    setTimeout(() => (window.location.href = 'index.html'), 2000);
  });
});

// AUTO-LOGIN on page load
window.addEventListener('load', () => {
  const user = localStorage.getItem('macx_loggedInUser');
  if (user) {
    const box = document.getElementById('messageBox');
    if (box) {
      box.innerText = `Welcome back, ${user}`;
      box.style.color = 'green';
    }
  }
});

// LOGOUT
function logout() {
  localStorage.removeItem('macx_loggedInUser');
  window.location.href = 'index.html';
}
