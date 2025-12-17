// 🔒 Block access if not logged in
const userId = localStorage.getItem("userId");

if (!userId) {
  alert("Please login first");
  window.location.href = "login.html";
}

// ✅ Call this when test is finished
async function submitTest(finalScore) {

  try {
    const response = await fetch("http://localhost:5000/save-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId,
        testName: "Web Development Test",
        score: finalScore
      })
    });

    const data = await response.json();
    console.log("TEST SAVE RESPONSE:", data);
    alert(data.message);

  } catch (error) {
    console.error(error);
    alert("Failed to save test result");
  }
}
