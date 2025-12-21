/* ---------------- MANUAL LOGIN ---------------- */
async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log("LOGIN RESPONSE:", data);

    if (response.ok && data.user && data.user._id) {
      localStorage.setItem("userId", data.user._id);
      window.location.href = "home.html";
    } else {
      alert(data.message || "Login failed");
    }

  } catch (error) {
    console.error(error);
    alert("Server connection failed");
  }
}

/* ---------------- GOOGLE LOGIN ---------------- */
/* MUST be global */
window.handleGoogleLogin = async function (response) {
  try {
    const res = await fetch("http://localhost:5000/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      // ✅ FIX: send `token`, not `credential`
      body: JSON.stringify({
        token: response.credential
      })
    });

    const data = await res.json();
    console.log("GOOGLE LOGIN RESPONSE:", data);

    if (data.user && data.user._id) {
      localStorage.setItem("userId", data.user._id);
      window.location.href = "home.html";
    } else {
      alert("Google login failed");
    }

  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    alert("Server error");
  }
};
