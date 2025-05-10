// File: admin.js

// Initialize GUN and global storage const gun = Gun(); const db = new PouchDB('macx_admin');

const accountList = document.getElementById('accountList'); const deletedAccounts = document.getElementById('deletedAccounts'); const searchInput = document.getElementById('searchUsername');

// Function to display accounts function displayAccounts(accounts) { accountList.innerHTML = ''; accounts.forEach(acc => { const div = document.createElement('div'); div.className = 'account'; div.innerHTML = <strong>Username:</strong> ${acc.username} <br> <strong>Email:</strong> ${acc.email} <br> <strong>Password:</strong> ${acc.password} <br> <button onclick="confirmDelete('${acc.username}')">Delete</button>; accountList.appendChild(div); }); }

// Function to show deleted account info function showDeletedAccount(username) { const div = document.createElement('div'); div.className = 'account'; div.innerText = Deleted: ${username}; deletedAccounts.appendChild(div); }

// Confirm delete in 3 steps let deleteCounter = {}; function confirmDelete(username) { deleteCounter[username] = (deleteCounter[username] || 0) + 1; if (deleteCounter[username] === 3) { gun.get('accounts').get(username).put(null); db.get(username).then(doc => db.remove(doc)); showDeletedAccount(username); alert(Account '${username}' deleted.); deleteCounter[username] = 0; fetchAccounts(); } else { alert(Click ${3 - deleteCounter[username]} more time(s) to confirm delete.); } }

// Fetch accounts from GUN and local db function fetchAccounts() { const accounts = []; gun.get('accounts').map().once((data, key) => { if (data && data.username && data.email && data.password) { accounts.push({ username: key, email: data.email, password: data.password }); db.put({ _id: key, username: key, email: data.email, password: data.password }).catch(() => {}); } displayAccounts(accounts); }); }

// Search functionality searchInput.addEventListener('input', () => { const query = searchInput.value.trim().toLowerCase(); if (!query) return fetchAccounts();

gun.get('accounts').get(query).once(data => { if (data) { displayAccounts([{ username: query, email: data.email, password: data.password }]); } else { accountList.innerHTML = '<p>No account found.</p>'; } }); });

// Load accounts on start fetchAccounts();

