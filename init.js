// Initialize Gun and User
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const user = gun.user();

// DOM Elements
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const recoverForm = document.getElementById('recoverForm');
const deleteForm = document.getElementById('deleteForm');
const changeForm = document.getElementById('changeForm');
const msgBox = document.getElementById('message');

// Utility: Show Message
function showMessage(msg, success = false) {
  if (!msgBox) return alert(msg);
  msgBox.textContent = msg;
  msgBox.style.color = success ? 'green' : 'red';
  setTimeout(() => msgBox.textContent = '', 4000);
}

// SIGNUP (with SEA + replication)
signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value.trim();
  if (!username || !email || !password) return showMessage("All signup fields required");

  // Check if user already exists
  gun.get('users').get(username).once(async (data) => {
    if (data) return showMessage("Username already taken");

    // Create secure user
    user.create(username, password, async (ack) => {
      if (ack.err) return showMessage("Signup failed: " + ack.err);

      // Store user metadata
      gun.get('users').get(username).put({
        created: Date.now(),
        email: email
      });

      // Secure password encryption
      const encPass = await Gun.SEA.encrypt(password, password);
      gun.get('user_passwords').get(username).put({ encPass });

      showMessage("Signup successful!", true);
    });
  });
});

// LOGIN (with SEA)
loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if (!username || !password) return showMessage("Login fields required");

  user.auth(username, password, (ack) => {
    if (ack.err) return showMessage("Login failed: " + ack.err);
    localStorage.setItem('macx_loggedInUser', username);
    showMessage("Login successful!", true);
    setTimeout(() => window.location.href = "home.html", 1000);
  });
});

// RECOVER (from SEA encrypted password)
recoverForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('recoverUsername').value.trim();
  const email = document.getElementById('recoverEmail').value.trim().toLowerCase();
  if (!username || !email) return showMessage("All recovery fields required");

  gun.get('users').get(username).once(async (data) => {
    if (!data) return showMessage("User not found");
    if ((data.email || '').toLowerCase() !== email) return showMessage("Email mismatch");

    gun.get('user_passwords').get(username).once(async (pwData) => {
      const dec = await Gun.SEA.decrypt(pwData.encPass, password);
      if (dec) showMessage(`Recovered Password: ${dec}`, true);
      else showMessage("Failed to decrypt password");
    });
  });
});

// DELETE
deleteForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('deleteUsername').value.trim();
  const email = document.getElementById('deleteEmail').value.trim().toLowerCase();
  const password = document.getElementById('deletePassword').value.trim();
  const c1 = document.getElementById('confirmDelete1')?.checked;
  const c2 = document.getElementById('confirmDelete2')?.checked;
  const c3 = document.getElementById('confirmDelete3')?.checked;

  if (!username || !email || !password || !c1 || !c2 || !c3) {
    return showMessage("All fields and confirmations required");
  }

  gun.get('users').get(username).once((data) => {
    if (!data) return showMessage("Account not found");
    if ((data.email || '').toLowerCase() !== email) {
      return showMessage("Email mismatch");
    }

    // Authenticate before delete
    user.auth(username, password, (ack) => {
      if (ack.err) return showMessage("Password incorrect");

      gun.get('users').get(username).put(null); // Delete metadata
      gun.get('user_passwords').get(username).put(null); // Delete password
      showMessage("Account deleted permanently", true);
      localStorage.removeItem('macx_loggedInUser');
    });
  });
});

// CHANGE PASSWORD
changeForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('changeUsername').value.trim();
  const email = document.getElementById('changeEmail').value.trim().toLowerCase();
  const oldPassword = document.getElementById('changeOldPassword').value.trim();
  const newPassword = document.getElementById('changeNewPassword').value.trim();

  if (!username || !email || !oldPassword || !newPassword) {
    return showMessage("All change password fields required");
  }

  // Verify user
  gun.get('users').get(username).once((data) => {
    if (!data) return showMessage("User not found");
    if ((data.email || '').toLowerCase() !== email) {
      return showMessage("Email mismatch");
    }

    // Authenticate
    user.auth(username, oldPassword, async (ack) => {
      if (ack.err) return showMessage("Old password incorrect");

      // Overwrite encrypted password manually (user.auth password still same)
      const encPass = await Gun.SEA.encrypt(newPassword, newPassword);
      gun.get('user_passwords').get(username).put({ encPass });
      showMessage("Password changed (custom login only)", true);
    });
  });
});
