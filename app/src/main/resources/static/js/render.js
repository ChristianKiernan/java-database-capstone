// render.js

function selectRole(role) {
  setRole(role);

  const token = localStorage.getItem("token");

  if (role === "admin") {
    if (token) window.location.href = `/adminDashboard/${token}`;
    return;
  }

  if (role === "patient") {
    window.location.href = "/pages/patientDashboard.html";
    return;
  }

  if (role === "doctor") {
    if (token) window.location.href = `/doctorDashboard/${token}`;
    return;
  }

  if (role === "loggedPatient") {
    window.location.href = "/pages/loggedPatientDashboard.html";
    return;
  }
}



function renderContent() {
  const role = getRole();
  if (!role) {
    window.location.href = "/"; // if no role, send to role selection page
    return;
  }
}
