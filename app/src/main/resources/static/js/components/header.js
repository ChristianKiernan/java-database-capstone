/*
  Step-by-Step Explanation of Header Section Rendering

  This code dynamically renders the header section of the page based on the user's role, session status, and available actions (such as login, logout, or role-switching).
*/

function renderHeader() {
  const headerDiv = document.getElementById("header");
  if (!headerDiv) return;

  // 1) Check the current page (don't show role-based header on homepage)
  if (window.location.pathname.endsWith("/")) {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");

    headerDiv.innerHTML = `
      <header class="header">
        <div class="logo-section">
          <img src="/assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
          <span class="logo-title">Hospital CMS</span>
        </div>
      </header>`;
    return;
  }

  // 2) Read role + token
  const role = localStorage.getItem("userRole");
  const token = localStorage.getItem("token");

  // 3) Invalid session guard
  if ((role === "loggedPatient" || role === "admin" || role === "doctor") && !token) {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    alert("Session expired or invalid login. Please log in again.");
    window.location.href = "/";
    return;
  }

  // 4) Build base header HTML
  let headerContent = `
    <header class="header">
      <div class="logo-section">
        <img src="../assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
        <span class="logo-title">Hospital CMS</span>
      </div>
      <nav class="nav">`;

  // 5) Role-specific content
  if (role === "admin") {
    headerContent += `
      <button id="addDocBtn" class="adminBtn" onclick="openModal('addDoctor')">Add Doctor</button>
      <a href="#" id="logoutLink">Logout</a>`;
  } else if (role === "doctor") {
    headerContent += `
      <button id="doctorHomeBtn" class="adminBtn">Home</button>
      <a href="#" id="logoutLink">Logout</a>`;
  } else if (role === "patient") {
    headerContent += `
      <button id="patientLogin" class="adminBtn">Login</button>
      <button id="patientSignup" class="adminBtn">Sign Up</button>`;
  } else if (role === "loggedPatient") {
    headerContent += `
      <button id="home" class="adminBtn">Home</button>
      <button id="patientAppointments" class="adminBtn">Appointments</button>
      <a href="#" id="logoutPatientLink">Logout</a>`;
  }

  // 6) Close header
  headerContent += `
      </nav>
    </header>`;

  // 7) Inject HTML + attach listeners
  headerDiv.innerHTML = headerContent;
  attachHeaderButtonListeners();
}

function attachHeaderButtonListeners() {
  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  const logoutPatientLink = document.getElementById("logoutPatientLink");
  if (logoutPatientLink) {
    logoutPatientLink.addEventListener("click", (e) => {
      e.preventDefault();
      logoutPatient();
    });
  }

  const patientLogin = document.getElementById("patientLogin");
  if (patientLogin) {
    patientLogin.addEventListener("click", () => openModal("patientLogin"));
  }

  const patientSignup = document.getElementById("patientSignup");
  if (patientSignup) {
    patientSignup.addEventListener("click", () => openModal("patientSignup"));
  }

  const doctorHomeBtn = document.getElementById("doctorHomeBtn");
  if (doctorHomeBtn) {
    doctorHomeBtn.addEventListener("click", () => {
      window.location.href = "/pages/doctorDashboard.html";
    });
  }

  const homeBtn = document.getElementById("home");
  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "/pages/loggedPatientDashboard.html";
    });
  }

  const apptBtn = document.getElementById("patientAppointments");
  if (apptBtn) {
    apptBtn.addEventListener("click", () => {
      window.location.href = "/pages/patientAppointments.html";
    });
  }
}

// Admin/Doctor logout: clear role + token and go home
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  window.location.href = "/";
}

// Patient logout: keep role as "patient" so login/signup shows again
function logoutPatient() {
  localStorage.removeItem("token");
  localStorage.setItem("userRole", "patient");
  window.location.href = "/pages/patientDashboard.html";
}

// Initialize header rendering
renderHeader();

