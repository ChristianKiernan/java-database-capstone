// /static/js/services/doctorServices.js
import { API_BASE_URL } from "../config/config.js";

// normalize: avoid double slashes if API_BASE_URL ends with "/"
const BASE = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const DOCTOR_API = `${BASE}/doctor`;

/**
 * Get all doctors
 * Controller: GET /doctor
 * Returns: { doctors: [...] }
 */
export async function getDoctors() {
  try {
    const res = await fetch(DOCTOR_API);
    if (!res.ok) throw new Error(`Failed to fetch doctors (${res.status})`);

    const data = await res.json();
    return { doctors: Array.isArray(data?.doctors) ? data.doctors : [] };
  } catch (err) {
    console.error("Error fetching doctors:", err);
    return { doctors: [] };
  }
}

/**
 * Delete a doctor (Admin only)
 * Controller: DELETE /doctor/{id}/{token}
 */
export async function deleteDoctor(id, token) {
  try {
    const res = await fetch(`${DOCTOR_API}/${encodeURIComponent(id)}/${encodeURIComponent(token)}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { success: false, message: data.message || `Delete failed (${res.status})` };
    }

    return { success: true, message: data.message || "Doctor deleted" };
  } catch (err) {
    console.error("Error deleting doctor:", err);
    return { success: false, message: "Server error while deleting doctor" };
  }
}

/**
 * Save (Add) a new doctor (Admin only)
 * Controller: POST /doctor/{token}
 */
export async function saveDoctor(doctor, token) {
  try {
    const res = await fetch(`${DOCTOR_API}/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(doctor),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { success: false, message: data.message || `Failed to save doctor (${res.status})` };
    }

    return { success: true, message: data.message || "Doctor saved successfully" };
  } catch (err) {
    console.error("Error saving doctor:", err);
    return { success: false, message: "Server error while saving doctor" };
  }
}

/**
 * Filter doctors by name, time, specialty
 * Controller: GET /doctor/filter/{name}/{time}/{speciality}
 * Returns: { doctors: [...] }
 */
export async function filterDoctors(name, time, specialty) {
  try {
    const n = (name && String(name).trim().length) ? String(name).trim() : "null";
    const t = (time && String(time).trim().length) ? String(time).trim() : "null";
    const s = (specialty && String(specialty).trim().length) ? String(specialty).trim() : "null";

    const url = `${DOCTOR_API}/filter/${encodeURIComponent(n)}/${encodeURIComponent(t)}/${encodeURIComponent(s)}`;

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Failed to filter doctors (${res.status})`);

    const data = await res.json();
    return { doctors: Array.isArray(data?.doctors) ? data.doctors : [] };
  } catch (err) {
    console.error("Error filtering doctors:", err);
    return { doctors: [] };
  }
}


