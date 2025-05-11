const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const users = gun.get('macx_users');
const accountsList = document.getElementById('accountsList');
const searchInput = document.getElementById('searchInput');

let userData = {}; // Store all loaded users

// Render a single user box
function renderUser(username, data) {
  const container = document.createElement('div');
  container.className = 'user-box';
  container.dataset.username = username;

  const info = document.createElement('p');
  info.textContent = `Username: ${username}, Email: ${data.email}, Password: ${data.password}`;

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete User';
  let confirmStage = 0;

  delBtn.addEventListener('click', () => {
    if (confirmStage === 0) {
      delBtn.textContent = 'Confirm (1/3)';
      confirmStage++;
    } else if (confirmStage === 1) {
      delBtn.textContent = 'Confirm (2/3)';
      confirmStage++;
    } else if (confirmStage === 2) {
      users.get(username).put(null); // Global deletion
      users.get(username).put({ deleted: true }); // Mark as deleted
      delBtn.textContent = 'Deleted';
      container.style.opacity = '0.5';
    }
  });

  container.appendChild(info);
  container.appendChild(delBtn);
  accountsList.appendChild(container);
}

// Load all accounts
users.map().once((data, username) => {
  if (!data || data.deleted || !username) return;
  userData[username] = data;
  renderUser(username, data);
});

// Search filter
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  accountsList.innerHTML = '';

  Object.entries(userData).forEach(([username, data]) => {
    if (username.toLowerCase().includes(query)) {
      renderUser(username, data);
    }
  });
});
