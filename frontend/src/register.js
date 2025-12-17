function registerUser(event) {
    event.preventDefault(); // stop page from reloading

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);

        if (data.message === "Registration successful!") {
            window.location.href = "LoginPage.html"; // redirect to login
        }
    })
    .catch(err => {
        alert("Cannot connect to server!");
        console.error(err);
    });
}
