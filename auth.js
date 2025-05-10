// File: auth.js const db = new PouchDB('macx_users'); const gun = Gun();

// SIGNUP const signupForm = document.getElementById('signupForm'); if (signupForm) { signupForm.addEventListener('submit', async (e) => { e.preventDefault(); const email = document.getElementById('signupEmail').value.trim(); const username = document.getElementById('signupUsername').value.trim(); const password = document.getElementById('signupPassword').value;

try {
  const existing = await db.get(username);
  alert('Username already exists.');
} catch (err) {
  if (err.status === 404) {
    const user = { _id: username, username, email, password };
    await db.put(user);
    gun.get('macx_users').get(username).put(user);
    alert('Signup successful. Please login.');
    signupForm.reset();
  } else {
    console.error(err);
    alert('Signup failed.');
  }
}

}); }

// LOGIN const loginForm = document.getElementById('loginForm'); if (loginForm) { loginForm.addEventListener('submit', async (e) => { e.preventDefault(); const username = document.getElementById('loginUsername').value.trim(); const password = document.getElementById('loginPassword').value;

try {
  const user = await db.get(username);
  if (user.password === password) {
    localStorage.setItem('loggedInUser', username);
    alert('Login successful!');
    window.location.href = 'home.html';
  } else {
    alert('Incorrect password.');
  }
} catch (err) {
  alert('User not found.');
}

}); }

// RECOVER PASSWORD const recoverForm = document.getElementById('recoverForm'); if (recoverForm) { recoverForm.addEventListener('submit', async (e) => { e.preventDefault(); const email = document.getElementById('recoverEmail').value.trim(); const username = document.getElementById('recoverUsername').value.trim();

try {
  const user = await db.get(username);
  if (user.email === email) {
    alert(`Your password is: ${user.password}`);
  } else {
    alert('Email does not match username.');
  }
} catch (err) {
  alert('User not found.');
}

}); }

// GLOBAL USERNAME DISPLAY const displayUser = document.getElementById('loggedInUser'); if (displayUser) { const user = localStorage.getItem('loggedInUser'); if (user) { displayUser.textContent = user; } }

