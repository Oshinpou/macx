// File: auth.js const db = new PouchDB('macx_users'); const gun = Gun();

let loggedInUser = null;

// Load logged-in user if already saved if (localStorage.getItem('macxLoggedIn')) { loggedInUser = JSON.parse(localStorage.getItem('macxLoggedIn')); showLoggedInUser(); }

function showLoggedInUser() { if (loggedInUser) { document.querySelectorAll('.logged-in').forEach(el => { el.innerHTML = Logged in as: <strong>${loggedInUser.username}</strong>; }); } }

// Handle Sign Up const signupForm = document.getElementById('signupForm'); if (signupForm) { signupForm.addEventListener('submit', async (e) => { e.preventDefault(); const username = document.getElementById('signupUsername').value.trim(); const email = document.getElementById('signupEmail').value.trim(); const password = document.getElementById('signupPassword').value;

try {
  const existing = await db.get(email);
  alert('Email already exists. Try login or recover.');
} catch (err) {
  if (err.status === 404) {
    await db.put({ _id: email, username, email, password });
    gun.get('macx_users').get(username).put({ username, email, password });
    alert('Signup successful. Please log in.');
    signupForm.reset();
  }
}

}); }

// Handle Login const loginForm = document.getElementById('loginForm'); if (loginForm) { loginForm.addEventListener('submit', async (e) => { e.preventDefault(); const email = document.getElementById('loginEmail').value.trim(); const password = document.getElementById('loginPassword').value;

try {
  const doc = await db.get(email);
  if (doc.password === password) {
    loggedInUser = doc;
    localStorage.setItem('macxLoggedIn', JSON.stringify(doc));
    alert('Login successful.');
    showLoggedInUser();
  } else {
    alert('Incorrect password.');
  }
} catch {
  alert('Account not found. Please sign up.');
}

}); }

// Handle Password Recovery const recoverForm = document.getElementById('recoverForm'); if (recoverForm) { recoverForm.addEventListener('submit', async (e) => { e.preventDefault(); const email = document.getElementById('recoverEmail').value.trim(); const username = document.getElementById('recoverUsername').value.trim();

try {
  const doc = await db.get(email);
  if (doc.username === username) {
    alert(`Password recovery success. Your password is: ${doc.password}`);
  } else {
    alert('Username does not match.');
  }
} catch {
  alert('No account found with that email.');
}

}); }

