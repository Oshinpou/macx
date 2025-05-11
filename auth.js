// Connect to GUN
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const users = gun.get('macx_users');

// Forms
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const recoverForm = document.getElementById('recoverForm');
const deleteForm = document.getElementById('deleteForm');

// Utility: show message
function showMessage(message, success = false) {
  const msgBox = document.getElementById('message');
  msgBox.textContent = message;
  msgBox.style.color = success ? 'green' : 'red';
  setTimeout(() => { msgBox.textContent = ''; }, 5000);
}

// Utility: check if logged in
function checkLogin() {
  const username = localStorage.getItem('macx_loggedInUser');
  if (username) {
    window.location.href = "home.html";
  }
}
checkLogin();

// SIGN UP
signupForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();

  if (!username || !email || !password) return showMessage("All signup fields required");

  users.get(username).once((data) => {
    if (data) return showMessage("Username already exists");

    // Live email check
    let duplicateFound = false;
    users.map().once((user) => {
      if (user?.email === email) {
        duplicateFound = true;
        showMessage("Email already in use");
      }
    });

    setTimeout(() => {
      if (duplicateFound) return;
      users.get(username).put({ username, email, password }, (ack) => {
        if (ack.err) return showMessage("Signup failed");
        showMessage("Signup successful!", true);
      });
    }, 1000); // Delay to let GUN scan users
  });
});

// LOGIN
loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!username || !password) return showMessage("Login fields required");

  users.get(username).once((data) => {
    if (!data) return showMessage("Account does not exist");
    if (data.password !== password) return showMessage("Incorrect password");

    localStorage.setItem('macx_loggedInUser', username);
    showMessage("Login successful!", true);
    setTimeout(() => window.location.href = "home.html", 1500);
  });
});

// RECOVER PASSWORD
recoverForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('recoverUsername').value.trim();
  const email = document.getElementById('recoverEmail').value.trim();

  if (!username || !email) return showMessage("Recovery fields required");

  users.get(username).once((data) => {
    if (!data) return showMessage("Username not found");
    if (data.email !== email) return showMessage("Email does not match");
    showMessage(`Recovered Password: ${data.password}`, true);
  });
});

// DELETE ACCOUNT
deleteForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('deleteUsername').value.trim();
  const email = document.getElementById('deleteEmail').value.trim();
  const password = document.getElementById('deletePassword').value.trim();
  const confirm1 = document.getElementById('confirmDelete1').checked;
  const confirm2 = document.getElementById('confirmDelete2').checked;
  const confirm3 = document.getElementById('confirmDelete3').checked;

  if (!username || !email || !password || !confirm1 || !confirm2 || !confirm3) {
    return showMessage("All fields and confirmations required");
  }

  users.get(username).once((data) => {
    if (!data) return showMessage("Account does not exist");
    if (data.email !== email || data.password !== password) {
      return showMessage("Credentials do not match");
    }

    // Delete user data
    users.get(username).put(null);
    showMessage("Account deleted permanently", true);
    if (localStorage.getItem('macx_loggedInUser') === username) {
      localStorage.removeItem('macx_loggedInUser');
    }
  });
});
