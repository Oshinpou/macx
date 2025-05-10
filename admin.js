// Use a public or your own Gun relay server to ensure cross-device sync
const gun = Gun(['https://gun-macx-server.herokuapp.com/gun']); // Replace with your own server for full control
const users = gun.get('macx_users');

const accountList = document.getElementById('accountList');
const searchInput = document.getElementById('searchUser');

// Render all accounts including deleted (marked)
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

// Confirm delete in 3 steps and store globally
function confirmDelete(key) {
  if (!confirm("Are you sure you want to delete this account?")) return;
  if (!confirm("This action is permanent across all devices. Proceed?")) return;
  if (!confirm("Final confirmation. DELETE account?")) return;

  users.get(key).put({ deleted: true });
  renderAccounts(searchInput.value);
}

// Search input listener
searchInput.addEventListener('input', () => {
  renderAccounts(searchInput.value);
});

// Initial render
renderAccounts();
