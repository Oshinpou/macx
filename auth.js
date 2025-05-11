// Connect to a public GUN relay
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const users = gun.get('macx_users');

// Elements
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const recoverForm = document.getElementById('recoverForm');

// Utility: Show message
function showMessage(message, success = false) {
  const msg = document.createElement('p');
  msg.textContent = message;
  msg.style.color = success ? 'green' : 'red';
  msg.style.marginTop = '0.5rem';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}

// FORM SWITCHING FUNCTION (Optional)
function switchForm(form) {
  signupForm.style.display = 'none';
  loginForm.style.display = 'none';
  recoverForm.style.display = 'none';
  if (form === 'login') loginForm.style.display = 'block';
  if (form === 'signup') signupForm.style.display = 'block';
  if (form === 'recover') recoverForm.style.display = 'block';
}

// Initial Form State
switchForm('login');

// SIGNUP
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();

  if (!username || !email || !password) return showMessage("All signup fields required");

  // Check if username exists
  users.get(username).once((data) => {
    if (data && data.username) {
      return showMessage("Username already exists");
    }

    // Check if email exists
    let emailExists = false;

    users.map().once((user) => {
      if (user && user.email === email) {
        emailExists = true;
        showMessage("Email already used");
      }
    });

    setTimeout(() => {
      if (emailExists) return;

      // Save user
      users.get(username).put({ username, email, password }, (ack) => {
        if (ack.err) return showMessage("Signup failed, try again");
        showMessage("Signup successful!", true);
      });
    }, 1000);
  });
});

// LOGIN
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!username || !password) return showMessage("All login fields required");

  users.get(username).once((data) => {
    if (!data) return showMessage("Account does not exist");
    if (data.password !== password) return showMessage("Incorrect password");

    localStorage.setItem('macx_loggedInUser', username);
    showMessage("Login successful!", true);
    setTimeout(() => window.location.href = "home.html", 1000);
  });
});

// RECOVER PASSWORD
recoverForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('recoverUsername').value.trim();
  const email = document.getElementById('recoverEmail').value.trim();

  if (!username || !email) return showMessage("All recovery fields required");

  users.get(username).once((data) => {
    if (!data) return showMessage("Username not found");
    if (data.email !== email) return showMessage("Email does not match");

    showMessage(`Recovered Password: ${data.password}`, true);
  });
});
