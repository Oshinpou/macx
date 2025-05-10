// Connect to the global GUN relay for storage
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const users = gun.get('macx_users');

// DOM elements for the admin panel
const accountList = document.getElementById('accountList');
const searchInput = document.getElementById('searchInput');
const deleteModal = document.getElementById('deleteModal');
const deleteConfirm = document.getElementById('deleteConfirm');
const deleteCancel = document.getElementById('deleteCancel');

// Utility: Show message in the UI
function showMessage(message, success = false) {
  const msg = document.createElement('p');
  msg.textContent = message;
  msg.style.color = success ? 'green' : 'red';
  msg.style.marginTop = '0.5rem';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}

// Render the accounts list from GUN
function renderAccounts() {
  accountList.innerHTML = ''; // Clear current list
  users.map().once((userData, username) => {
    if (userData) {
      const accountItem = document.createElement('div');
      accountItem.className = 'account-item';
      accountItem.dataset.username = username; // Store username as a data attribute
      accountItem.innerHTML = `
        <p>Username: ${username}</p>
        <p>Email: ${userData.email}</p>
        <button onclick="openDeleteModal('${username}')">Delete</button>
      `;
      accountList.appendChild(accountItem);
    }
  });
}

// Search functionality
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  const accountItems = document.querySelectorAll('.account-item');
  accountItems.forEach(item => {
    const accountText = item.textContent.toLowerCase();
    if (accountText.includes(searchTerm)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
});

// Open delete confirmation modal
function openDeleteModal(username) {
  deleteModal.style.display = 'block';
  deleteConfirm.onclick = () => deleteAccount(username);
  deleteCancel.onclick = () => {
    deleteModal.style.display = 'none'; // Close the modal without deleting
  };
}

// Delete account permanently from all devices
function deleteAccount(username) {
  users.get(username).put(null, (ack) => {
    if (ack.err) {
      showMessage('Error deleting account. Please try again.', false);
      return;
    }
    showMessage('Account deleted successfully!', true);
    renderAccounts(); // Re-render the accounts list
    deleteModal.style.display = 'none'; // Close the modal
  });
}

// Listen for real-time updates across all devices and render accounts
users.map().on((data, username) => {
  renderAccounts(); // Re-render the accounts list when there are any changes
});

// Initial render of accounts when the page loads
renderAccounts();
