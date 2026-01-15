// patientServices.js
// Centralized API communication for patient-related actions

import { API_BASE_URL } from "../config/config.js";

// Base endpoint for patient-related APIs
const PATIENT_API = API_BASE_URL + "/patient";

/**
 * Patient Signup
 * - Accepts patient details
 * - Sends POST request to signup endpoint
 * - Returns { success, message }
 */
export async function patientSignup(data) {
  try {
    // Send signup request
    const res = await fetch(`${PATIENT_API}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // Parse response JSON (if any)
    const result = await res.json().catch(() => ({}));

    // Return structured response
    if (res.ok) {
      return { success: true, message: result.message || "Signup successful" };
    }

    return { success: false, message: result.message || "Signup failed" };
  } catch (err) {
    console.error("patientSignup error:", err);
    return { success: false, message: "Server error during signup" };
  }
}

/**
 * Patient Login
 * - Accepts login credentials (email, password)
 * - Sends POST request to login endpoint
 * - Returns the full fetch response so UI can handle status/token
 */
export async function patientLogin(data) {
  try {
    // Helpful during development (remove in production)
    console.log("patientLogin payload:", data);

    // Send login request
    const res = await fetch(`${PATIENT_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return res;
  } catch (err) {
    console.error("patientLogin error:", err);
    throw err;
  }
}

/**
 * Fetch Logged-in Patient Data
 * - Uses token to request patient profile/details
 * - Returns patient object or null on failure
 */
export async function getPatientData(token) {
  try {
    // Request patient data
    const res = await fetch(`${PATIENT_API}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return null;

    // Return patient object
    const patient = await res.json();
    return patient;
  } catch (err) {
    console.error("getPatientData error:", err);
    return null;
  }
}

/**
 * Fetch Patient Appointments (shared for patient & doctor dashboards)
 * - id: patient id
 * - token: auth token
 * - user: "patient" or "doctor"
 * - Returns appointments array or null on failure
 */
export async function getPatientAppointments(id, token, user) {
  try {
    // Build dynamic endpoint (supports role-based backend behavior)
    const url = `${PATIENT_API}/${id}/appointments?user=${encodeURIComponent(user)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("getPatientAppointments failed:", res.status);
      return null;
    }

    const appointments = await res.json();
    return appointments;
  } catch (err) {
    console.error("getPatientAppointments error:", err);
    return null;
  }
}

/**
 * Filter Appointments
 * - condition: e.g. "pending", "consulted"
 * - name: optional search term
 * - token: auth token
 * - Returns filtered list or [] on failure
 */
export async function filterAppointments(condition, name, token) {
  try {
    // Build query params safely
    const params = new URLSearchParams();
    if (condition) params.append("condition", condition);
    if (name) params.append("name", name);

    const res = await fetch(`${PATIENT_API}/appointments/filter?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("filterAppointments failed:", res.status);
      return [];
    }

    const filtered = await res.json();
    return filtered;
  } catch (err) {
    console.error("filterAppointments error:", err);
    alert("Unexpected error while filtering appointments. Please try again.");
    return [];
  }
}