// auth.js

const db = new PouchDB('macx_users');
const gun = Gun();

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');
  const recoverForm = document.getElementById('recoverForm');

  // Show message
  function showMessage(form, msg, success = true) {
    let msgBox = form.querySelector('.message');
    if (!msgBox) {
      msgBox = document.createElement('p');
      msgBox.className = 'message';
      form.appendChild(msgBox);
    }
    msgBox.style.color = success ? 'green' : 'red';
    msgBox.textContent = msg;
  }

  // Signup
  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!username || !email || !password) {
      showMessage(signupForm, 'All fields are required', false);
      return;
    }

    try {
      const result = await db.allDocs({ include_docs: true });
      const exists = result.rows.some(row =>
        row.doc.username === username || row.doc.email === email
      );

      if (exists) {
        showMessage(signupForm, 'Username or Email already exists', false);
        return;
      }

      const user = {
        _id: 'user_' + username,
        username,
        email,
        password,
      };

      await db.put(user);
      gun.get('macx_users').get(username).put({ email, password });

      showMessage(signupForm, 'Account created successfully');
      signupForm.reset();
    } catch (err) {
      console.error('Signup Error:', err);
      showMessage(signupForm, 'Signup failed: ' + err.message, false);
    }
  });

  // Login
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
      showMessage(loginForm, 'Both fields are required', false);
      return;
    }

    try {
      const result = await db.allDocs({ include_docs: true });
      const user = result.rows.find(
        row => row.doc.username === username && row.doc.password === password
      );

      if (user) {
        sessionStorage.setItem('macx_user', username);
        window.location.href = 'home.html';
      } else {
        showMessage(loginForm, 'Invalid username or password', false);
      }
    } catch (err) {
      console.error('Login Error:', err);
      showMessage(loginForm, 'Login failed: ' + err.message, false);
    }
  });

  // Recover Password
  recoverForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('recoverUsername').value.trim();
    const email = document.getElementById('recoverEmail').value.trim();

    if (!username || !email) {
      showMessage(recoverForm, 'Both fields are required', false);
      return;
    }

    try {
      const result = await db.allDocs({ include_docs: true });
      const user = result.rows.find(
        row => row.doc.username === username && row.doc.email === email
      );

      if (user) {
        showMessage(recoverForm, 'Password: ' + user.doc.password);
      } else {
        showMessage(recoverForm, 'No account found with these details', false);
      }
    } catch (err) {
      console.error('Recovery Error:', err);
      showMessage(recoverForm, 'Recovery failed: ' + err.message, false);
    }
  });
});
