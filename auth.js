// auth.js with public GUN relay for global sync

const gun = Gun({ peers: ['https://gun-manhattan.herokuapp.com/gun'] });

const users = gun.get('macx_users');

function showMessage(msg, isError = false) { const el = document.createElement('p'); el.textContent = msg; el.style.color = isError ? 'red' : 'green'; document.querySelector('.container').appendChild(el); setTimeout(() => el.remove(), 4000); }

// Sign Up const signupForm = document.getElementById('signupForm'); signupForm.addEventListener('submit', e => { e.preventDefault(); const username = document.getElementById('signupUsername').value.trim(); const email = document.getElementById('signupEmail').value.trim(); const password = document.getElementById('signupPassword').value;

users.get(username).once(data => { if (data) { showMessage('Username already exists', true); } else { users.get(username).put({ email, password }); showMessage('Account successfully created'); signupForm.reset(); } }); });

// Login const loginForm = document.getElementById('loginForm'); loginForm.addEventListener('submit', e => { e.preventDefault(); const username = document.getElementById('loginUsername').value.trim(); const password = document.getElementById('loginPassword').value;

users.get(username).once(data => { if (!data) { showMessage('User not found', true); } else if (data.password !== password) { showMessage('Incorrect password', true); } else { localStorage.setItem('macxLoggedInUser', username); showMessage('Login successful'); setTimeout(() => { window.location.href = 'home.html'; // Redirect to next page }, 1000); } }); });

// Recover Password const recoverForm = document.getElementById('recoverForm'); recoverForm.addEventListener('submit', e => { e.preventDefault(); const username = document.getElementById('recoverUsername').value.trim(); const email = document.getElementById('recoverEmail').value.trim();

users.get(username).once(data => { if (!data) { showMessage('Username not found', true); } else if (data.email !== email) { showMessage('Email does not match', true); } else { showMessage(Your password is: ${data.password}); } }); });

                                  
