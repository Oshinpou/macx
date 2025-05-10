// File: admin.js const adminUser = { username: "macxadmin", password: "supersecure123" };

// Admin login handler const adminLoginForm = document.getElementById('adminLoginForm'); if (adminLoginForm) { adminLoginForm.addEventListener('submit', (e) => { e.preventDefault(); const username = document.getElementById('adminUsername').value.trim(); const password = document.getElementById('adminPassword').value;

if (username === adminUser.username && password === adminUser.password) {
  localStorage.setItem('macxAdminLoggedIn', JSON.stringify(adminUser));
  window.location.href = 'admin-panel.html';
} else {
  alert('Invalid admin credentials.');
}

}); }

// Admin panel logic if (window.location.pathname.includes('admin-panel.html')) { const loggedAdmin = JSON.parse(localStorage.getItem('macxAdminLoggedIn')); if (!loggedAdmin || loggedAdmin.username !== adminUser.username) { alert("Unauthorized access. Redirecting to admin login."); window.location.href = 'admin-login.html'; } else { document.getElementById('adminUser').innerText = loggedAdmin.username; showAllUsers(); } }

async function showAllUsers() { const userResults = document.getElementById('userResults'); userResults.innerHTML = '';

try { const result = await new PouchDB('macx_users').allDocs({ include_docs: true }); result.rows.forEach(row => { const user = row.doc; const div = document.createElement('div'); div.innerHTML = <hr> <p><strong>Username:</strong> ${user.username}</p> <p><strong>Email:</strong> ${user.email}</p> <button onclick="confirmDelete('${user._id}', '${user._rev}')">Delete</button>; userResults.appendChild(div); }); } catch (err) { console.error(err); } }

let confirmCounter = 0; function confirmDelete(id, rev) { confirmCounter++; if (confirmCounter < 3) { alert(Click delete ${3 - confirmCounter} more time(s) to confirm.); } else { new PouchDB('macx_users').remove(id, rev).then(() => { alert('User deleted.'); confirmCounter = 0; showAllUsers(); }).catch(err => console.error(err)); } }

function searchUser() { const usernameSearch = document.getElementById('searchInput').value.trim().toLowerCase(); const allResults = document.querySelectorAll('#userResults > div'); allResults.forEach(div => { div.style.display = div.innerHTML.toLowerCase().includes(usernameSearch) ? 'block' : 'none'; }); }

