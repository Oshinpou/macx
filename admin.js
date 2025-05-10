// Connect to GUN relay for global sync
const gun = Gun(['https://gun-macx-server.herokuapp.com/gun']); // Replace with your own relay if needed
const users = gun.get('macx_users');

const accountList = document.getElementById('accountList');
const searchInput = document.getElementById('searchUser');

// Function to render all accounts with optional filter
function renderAccounts(filter = '') {
  accountList.innerHTML = '';
  users.map().once((data, key) => {
    if (!data || !data.username || !data.email || !data.password) return;

    const username = data.username.toLowerCase();
    const matchesSearch = username.includes(filter.toLowerCase());

    if (!matchesSearch) return;

    const div = document.createElement('div');
    div.className = data.deleted ? 'account deleted' : 'account';
    div.innerHTML = `
      <strong>Username:</strong> ${data.username}<br>
      <strong>Email:</strong> ${data.email}<br>
      <strong>Password:</strong> ${data.password}<br>
      ${data.deleted ? '<em>(Deleted)</em>' : `<button onclick="confirmDelete('${key}')">Delete</button>`}
    `;
    accountList.appendChild(div);
  });
}

// Delete account with 3 confirmations
function confirmDelete(key) {
  if (!confirm("Are you sure you want to delete this account?")) return;
  if (!confirm("This action will delete the account across all devices.")) return;
  if (!confirm("Final confirmation: Delete permanently?")) return;

  users.get(key).put({ deleted: true });
  renderAccounts(searchInput.value);
}

// Search functionality
searchInput.addEventListener('input', () => {
  renderAccounts(searchInput.value);
});

// Live reload of updates from other devices
users.map().on(() => {
  renderAccounts(searchInput.value);
});

// Initial render
renderAccounts();
