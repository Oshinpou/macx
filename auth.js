// File: auth.js const gun = Gun(); const db = new PouchDB('macx_users');

const loginForm = document.getElementById('loginForm'); const signupForm = document.getElementById('signupForm'); const recoverForm = document.getElementById('recoverForm'); const messageDiv = document.getElementById('message'); const recoveredPassword = document.getElementById('recoveredPassword');

function showMessage(text, isError = false) { messageDiv.textContent = text; messageDiv.style.color = isError ? 'red' : 'green'; }

function switchForm(formType) { loginForm.style.display = 'none'; signupForm.style.display = 'none'; recoverForm.style.display = 'none'; messageDiv.textContent = ''; recoveredPassword.textContent = '';

if (formType === 'login') loginForm.style.display = 'block'; else if (formType === 'signup') signupForm.style.display = 'block'; else if (formType === 'recover') recoverForm.style.display = 'block'; }

switchForm('login');

signupForm.addEventListener('submit', async (e) => { e.preventDefault(); const username = document.getElementById('signupUsername').value.trim(); const email = document.getElementById('signupEmail').value.trim(); const password = document.getElementById('signupPassword').value;

if (!username || !email || !password) return showMessage('All fields are required', true);

try { const result = await db.allDocs({ include_docs: true }); const exists = result.rows.find(row => row.doc.username === username || row.doc.email === email); if (exists) return showMessage('Username or Email already exists', true);

const user = { _id: new Date().toISOString(), username, email, password };
await db.put(user);
gun.get('macx_users').get(username).put({ email, password });
showMessage('Account created successfully');
signupForm.reset();

} catch (err) { showMessage('Signup failed', true); } });

loginForm.addEventListener('submit', async (e) => { e.preventDefault(); const username = document.getElementById('loginUsername').value.trim(); const password = document.getElementById('loginPassword').value;

try { const result = await db.allDocs({ include_docs: true }); const user = result.rows.find(row => row.doc.username === username && row.doc.password === password); if (!user) return showMessage('Invalid username or password', true);

localStorage.setItem('macxLoggedInUser', username);
showMessage('Login successful');
setTimeout(() => window.location.href = 'home.html', 1000);

} catch (err) { showMessage('Login failed', true); } });

recoverForm.addEventListener('submit', async (e) => { e.preventDefault(); const username = document.getElementById('recoverUsername').value.trim(); const email = document.getElementById('recoverEmail').value.trim();

try { const result = await db.allDocs({ include_docs: true }); const user = result.rows.find(row => row.doc.username === username && row.doc.email === email); if (!user) return showMessage('No account matches provided info', true);

recoveredPassword.textContent = `Password: ${user.doc.password}`;
showMessage('Password recovered');

} catch (err) { showMessage('Recovery failed', true); } });

