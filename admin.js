const gun = Gun(['https://gun-macx-server.herokuapp.com/gun']); // Optional: use your own peer
const db = gun.get('macx_users');
const accountList = document.getElementById('accountList');
const searchUser = document.getElementById('searchUser');

function renderAccounts(filter = '') {
  accountList.innerHTML = '';
  db.map().once((data, key) => {
    if (!data || !data.username) return;

    if (!data.deleted && data.username.toLowerCase().includes(filter.toLowerCase())) {
      const div = document.createElement('div');
      div.className = 'account';
      div.innerHTML = `
        <strong>Username:</strong> ${data.username}<br>
        <strong>Email:</strong> ${data.email}<br>
        <strong>Password:</strong> ${data.password}<br>
        <button onclick="confirmDelete('${key}')">Delete</button>
      `;
      accountList.appendChild(div);
    } else if (data.deleted && data.username.toLowerCase().includes(filter.toLowerCase())) {
      const div = document.createElement('div');
      div.className = 'account deleted';
      div.innerHTML = `
        <strong>Deleted Username:</strong> ${data.username}<br>
        <strong>Email:</strong> ${data.email}<br>
        <strong>Password:</strong> ${data.password}<br>
        <em>(Deleted)</em>
      `;
      accountList.appendChild(div);
    }
  });
}

function confirmDelete(key) {
  let confirm1 = confirm("Are you sure you want to delete this account?");
  if (!confirm1) return;
  let confirm2 = confirm("This action is global. Confirm again to continue.");
  if (!confirm2) return;
  let confirm3 = confirm("Final confirmation. This will be stored globally.");
  if (!confirm3) return;

  db.get(key).put({ deleted: true });
  renderAccounts(searchUser.value);
}

searchUser.addEventListener('input', () => renderAccounts(searchUser.value));

// Initial render
renderAccounts();
