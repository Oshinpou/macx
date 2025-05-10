// File: auth.js

const gun = Gun();
const db = new PouchDB("macx_users");

document.getElementById("universalForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const mode = document.querySelector('input[name="mode"]:checked').value;
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username) return alert("Username is required.");

  try {
    const existingUsers = await db.allDocs({ include_docs: true });
    const users = existingUsers.rows.map(row => row.doc);

    if (mode === "signup") {
      if (!email || !password) return alert("Email and password are required.");
      const userExists = users.find(u => u.username === username || u.email === email);
      if (userExists) return alert("Username or email already exists!");

      const newUser = { _id: username, username, email, password };
      await db.put(newUser);
      gun.get("users").get(username).put(newUser);
      alert("Account created successfully!");

    } else if (mode === "login") {
      if (!password) return alert("Password is required.");
      const user = users.find(u => u.username === username && u.password === password);
      if (!user) return alert("Invalid username or password!");

      localStorage.setItem("macx_user", username);
      alert("Login successful!");
      window.location.href = "homepage.html";

    } else if (mode === "recover") {
      if (!email) return alert("Email is required.");
      const user = users.find(u => u.username === username && u.email === email);
      if (!user) return alert("Account not found!");
      alert(`Recovered Password: ${user.password}`);
    }

  } catch (err) {
    console.error(err);
    alert("An error occurred. Please try again.");
  }
});
