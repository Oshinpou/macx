// Connect to a public persistent GUN relay
const gun = Gun(['https://gunjs.herokuapp.com/gun']);
const users = gun.get('macx_users');

// Elements
const userTable = document.getElementById('userTableBody');
const searchInput = document.getElementById('searchInput');

// Store user data in memory
const userData = {};

// Real-time listener for all users
users.map().on((data, username) => {
  if (!data || data.deleted || !username) return;
  userData[username] = data;
  renderUsers();
});

// Render users based on search
function renderUsers() {
  const search = searchInput.value.trim().toLowerCase();
  userTable.innerHTML = '';

  Object.entries(userData).forEach(([username, data]) => {
    if (!username.toLowerCase().includes(search)) return;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${data.username}</td>
      <td>${data.email}</td>
      <td>${data.password}</td>
      <td><button onclick="confirmDelete('${username}')">Delete</button></td>
    `;
    userTable.appendChild(row);
  });
}

// Search input listener
searchInput.addEventListener('input', renderUsers);

// Confirm delete with 3 confirmations
function confirmDelete(username) {
  const confirmations = [
    "Are you sure you want to delete this account?",
    "This action is permanent. Proceed?",
    "Final confirmation: Delete the account?"
  ];

  let i = 0;
  function nextConfirm() {
    if (i < confirmations.length) {
      if (confirm(confirmations[i++])) {
        nextConfirm();
      }
    } else {
      users.get(username).put({ deleted: true }, (ack) => {
        if (ack.err) {
          alert("Failed to delete user.");
        } else {
          delete userData[username];
          renderUsers();
          alert("User deleted permanently.");
        }
      });
    }
  }
  nextConfirm();
}
