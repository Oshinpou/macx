// Use a public Gun relay or your own deployed peer
const gun = Gun(['https://gun-macx-server.herokuapp.com/gun']); // Replace with your relay
const users = gun.get('macx_users');

const accountList = document.getElementById('accountList');
const searchInput = document.getElementById('searchUser');

// Render accounts with optional filter
function renderAccounts(filter = '') {
  accountList.innerHTML = '';
  users.map().once((data, key) => {
    if (!data || !data.username || !data.email || !data.password) return;
    if (filter && !data.username.toLowerCase().includes(filter.toLowerCase())) return;

    const div = document.createElement('div');
    div.className = 'account';
    div.innerHTML = `
      <strong>Username:</strong> ${data.username}<br>
      <strong>Email:</strong> ${data.email}<br>
      <strong>Password:</strong> ${data.password}<br>
      <button onclick="confirmDelete('${key}')">Delete</button>
    `;
    accountList.appendChild(div);
  });
}

// Permanently delete user from GUN
function confirmDelete(key) {
  if (!confirm("Are you sure you want to delete this account globally?")) return;
  if (!confirm("This will remove the account from all devices permanently.")) return;
  if (!confirm("Final confirmation: Delete permanently?")) return;

  users.get(key).put(null); // Completely delete from GUN
}

// Search bar
searchInput.addEventListener('input', () => {
  renderAccounts(searchInput.value);
});

// Real-time updates from GUN
users.map().on(() => {
  renderAccounts(searchInput.value);
});

// Initial load
renderAccounts();
