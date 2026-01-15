// doctorServices.js
import { API_BASE_URL } from "../config/config.js";

// Base endpoint for doctor-related APIs
const DOCTOR_API = API_BASE_URL + "/doctor";

/**
 * Get all doctors
 */
export async function getDoctors() {
  try {
    const res = await fetch(DOCTOR_API);
    if (!res.ok) throw new Error("Failed to fetch doctors");

    const data = await res.json();

    // Normalize: always return an array
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.doctors)) return data.doctors;

    return [];
  } catch (err) {
    console.error("Error fetching doctors:", err);
    return [];
  }
}


/**
 * Delete a doctor (Admin only)
 */
export async function deleteDoctor(id, token) {
  try {
    const res = await fetch(`${DOCTOR_API}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message || "Delete failed" };
    }

    return { success: true, message: data.message || "Doctor deleted" };
  } catch (err) {
    console.error("Error deleting doctor:", err);
    return { success: false, message: "Server error while deleting doctor" };
  }
}

/**
 * Save (Add) a new doctor (Admin only)
 */
export async function saveDoctor(doctor, token) {
  try {
    const res = await fetch(DOCTOR_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(doctor),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message || "Failed to save doctor" };
    }

    return { success: true, message: data.message || "Doctor saved successfully" };
  } catch (err) {
    console.error("Error saving doctor:", err);
    return { success: false, message: "Server error while saving doctor" };
  }
}

/**
 * Filter doctors by name, time, and specialty
 */
export async function filterDoctors(name, time, specialty) {
  try {
    // Backend expects path params: /filter/{name}/{time}/{speciality}
    // Use "null" for any missing segment (your controller normalizes these)
    const n = name && name.trim().length > 0 ? encodeURIComponent(name.trim()) : "null";
    const t = time && time.trim().length > 0 ? encodeURIComponent(time.trim()) : "null";
    const s = specialty && specialty.trim().length > 0 ? encodeURIComponent(specialty.trim()) : "null";

    const url = `${DOCTOR_API}/filter/${n}/${t}/${s}`;

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error("Failed to filter doctors");

    const data = await res.json();
    return data; // controller returns Map<String,Object>, usually { doctors: [...] }
  } catch (err) {
    console.error("Error filtering doctors:", err);
    alert("Unable to filter doctors. Please try again.");
    return { doctors: [] };
  }
}

