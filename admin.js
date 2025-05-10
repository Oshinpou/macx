// Connect to the same shared GUN relay used in auth.js
const gun = Gun(['https://gun-macx-server.herokuapp.com/gun']);
const users = gun.get('macx_users');

const accountList = document.getElementById('accountList');
const searchInput = document.getElementById('searchUser');

// Render users globally with optional filter
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

// Delete the account globally from GUN
function confirmDelete(key) {
  if (
    confirm("Are you sure you want to delete this account globally?") &&
    confirm("This action will permanently remove the account from all devices.") &&
    confirm("Final confirmation: Delete account now?")
  ) {
    users.get(key).put(null); // Truly deletes the data
  }
}

// Real-time listening
users.map().on(() => {
  renderAccounts(searchInput.value);
});

// Search functionality
searchInput.addEventListener('input', () => {
  renderAccounts(searchInput.value);
});

// Initial render
renderAccounts();
