// Connect to GUN using the Manhattan relay
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const users = gun.get('macx_users');

// DOM elements
const accountList = document.getElementById('accountList');
const searchInput = document.getElementById('searchInput');
const deleteModal = document.getElementById('deleteModal');
const deleteConfirm = document.getElementById('deleteConfirm');
const deleteCancel = document.getElementById('deleteCancel');

let accountToDelete = null;

// Function: Show message
function showMessage(text, isSuccess = true) {
  const msg = document.createElement('div');
  msg.textContent = text;
  msg.style.color = isSuccess ? 'green' : 'red';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

// Function: Render accounts from GUN
function renderAccounts() {
  accountList.innerHTML = '';
  users.map().once((data, key) => {
    if (data && data.username && data.email) {
      const item = document.createElement('div');
      item.className = 'account-item';
      item.innerHTML = `
        <strong>${data.username}</strong> (${data.email})
        <button onclick="openDeleteModal('${key}')">Delete</button>
      `;
      accountList.appendChild(item);
    }
  });
}

// Function: Open delete confirmation modal
function openDeleteModal(username) {
  accountToDelete = username;
  deleteModal.style.display = 'flex';
}

// Function: Permanently delete the account
function deleteAccountGlobally() {
  if (!accountToDelete) return;

  users.get(accountToDelete).put(null, ack => {
    if (ack.err) {
      showMessage('Failed to delete account.', false);
    } else {
      showMessage('Account deleted permanently.', true);
      renderAccounts();
    }
    deleteModal.style.display = 'none';
    accountToDelete = null;
  });
}

// Event listeners
deleteConfirm.addEventListener('click', deleteAccountGlobally);
deleteCancel.addEventListener('click', () => {
  deleteModal.style.display = 'none';
  accountToDelete = null;
});

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const items = document.querySelectorAll('.account-item');
  items.forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(query) ? 'block' : 'none';
  });
});

// Listen for real-time changes
users.map().on(() => renderAccounts());

// Initial fetch
renderAccounts();
