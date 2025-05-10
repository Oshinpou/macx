// File: auth.js const db = new PouchDB('macx_users'); const gun = Gun();

// UNIVERSAL FORM HANDLER (SIGNUP IF USER NOT EXISTS, OTHERWISE LOGIN OR RECOVER) const universalForm = document.getElementById('universalForm'); if (universalForm) { universalForm.addEventListener('submit', async (e) => { e.preventDefault(); const email = document.getElementById('email').value.trim(); const username = document.getElementById('username').value.trim(); const password = document.getElementById('password').value.trim(); const mode = document.querySelector('input[name="mode"]:checked').value;

if (!email || !username || !password) return alert('All fields are required.');

try {
  const existingUser = await db.get(username);

  if (mode === 'signup') {
    alert('Username already exists.');
    return;
  }

  if (mode === 'login') {
    if (existingUser.password === password) {
      localStorage.setItem('loggedInUser', username);
      alert('Login successful.');
      window.location.href = 'home.html';
    } else {
      alert('Incorrect password.');
    }
    return;
  }

  if (mode === 'recover') {
    if (existingUser.email === email) {
      alert(`Recovered password: ${existingUser.password}`);
    } else {
      alert('Email does not match our records.');
    }
    return;
  }
} catch (err) {
  if (err.status === 404 && mode === 'signup') {
    const newUser = { _id: username, username, email, password };
    await db.put(newUser);
    gun.get('macx_users').get(username).put(newUser);
    alert('Signup successful! You can now login.');
    universalForm.reset();
  } else {
    alert('User not found.');
  }
}

}); }

// GLOBAL USERNAME DISPLAY const displayUser = document.getElementById('loggedInUser'); if (displayUser) { const user = localStorage.getItem('loggedInUser'); if (user) { displayUser.textContent = user; } }

