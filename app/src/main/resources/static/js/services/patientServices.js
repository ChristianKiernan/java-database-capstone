// patientServices.js
import { API_BASE_URL } from "../config/config.js";

// IMPORTANT: API_BASE_URL should be "" for same-origin in your setup
const PATIENT_API = `${API_BASE_URL}/patient`;

/**
 * Patient Signup
 * POST /patient
 */
export async function patientSignup(data) {
  try {
    const res = await fetch(PATIENT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json().catch(() => ({}));

    if (res.ok) return { success: true, message: result.message || "Signup successful" };
    return { success: false, message: result.message || "Signup failed" };
  } catch (err) {
    console.error("patientSignup error:", err);
    return { success: false, message: "Server error during signup" };
  }
}

/**
 * Patient Login
 * POST /patient/login
 */
export async function patientLogin(data) {
  try {
    const res = await fetch(`${PATIENT_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res; // caller parses token, status, etc.
  } catch (err) {
    console.error("patientLogin error:", err);
    throw err;
  }
}

/**
 * Logged-in Patient Profile
 * GET /patient/{token}
 *
 * Backend validates token as "patient".
 * Returns a ResponseEntity<Map<String,Object>> from patientService.getPatientDetails(token).
 */
export async function getPatientData(token) {
  try {
    const res = await fetch(`${PATIENT_API}/${encodeURIComponent(token)}`);
    if (!res.ok) return null;

    const data = await res.json();

    // normalize: backend might return { patient: {...} } or direct patient fields
    if (data?.patient) return data.patient;
    return data;
  } catch (err) {
    console.error("getPatientData error:", err);
    return null;
  }
}

/**
 * Patient Appointments
 * GET /patient/{id}/{token}
 *
 * Returns Map<String,Object> (likely { appointments: [...] }).
 */
export async function getPatientAppointments(id, token) {
  try {
    const res = await fetch(
      `${PATIENT_API}/${encodeURIComponent(id)}/${encodeURIComponent(token)}`
    );

    if (!res.ok) return [];

    const data = await res.json();

    // normalize
    if (Array.isArray(data)) return data;
    return data?.appointments ?? [];
  } catch (err) {
    console.error("getPatientAppointments error:", err);
    return [];
  }
}

/**
 * Filter Patient Appointments
 * GET /patient/filter/{condition}/{name}/{token}
 *
 * condition and name can be "null"
 */
export async function filterAppointments(condition, name, token) {
  try {
    const c = condition ?? "null";
    const n = name ?? "null";

    const res = await fetch(
      `${PATIENT_API}/filter/${encodeURIComponent(c)}/${encodeURIComponent(n)}/${encodeURIComponent(token)}`
    );

    if (!res.ok) return [];

    const data = await res.json();

    // normalize
    if (Array.isArray(data)) return data;
    return data?.appointments ?? [];
  } catch (err) {
    console.error("filterAppointments error:", err);
    return [];
  }
}
