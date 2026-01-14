package com.project.back_end.services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Admin;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AdminRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;

@Service
public class Service {

    private final TokenService tokenService;
    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DoctorService doctorService;
    private final PatientService patientService;

    public Service(
            TokenService tokenService,
            AdminRepository adminRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            DoctorService doctorService,
            PatientService patientService
    ) {
        this.tokenService = tokenService;
        this.adminRepository = adminRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.doctorService = doctorService;
        this.patientService = patientService;
    }

    /**
     * Validate a token for a given user type (admin/doctor/patient).
     * Returns 401 with a message if invalid/expired, otherwise 200 OK with empty body map.
     */
    public ResponseEntity<Map<String, String>> validateToken(String token, String user) {
        Map<String, String> res = new HashMap<>();
        try {
            boolean valid = tokenService.validateToken(token, user);
            if (!valid) {
                res.put("message", "Invalid or expired token.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
            }
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            res.put("message", "Error validating token.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    /**
     * Validate admin credentials and return token if successful.
     */
    public ResponseEntity<Map<String, String>> validateAdmin(Admin receivedAdmin) {
        Map<String, String> res = new HashMap<>();
        try {
            if (receivedAdmin == null || receivedAdmin.getUsername() == null || receivedAdmin.getPassword() == null) {
                res.put("message", "Missing credentials.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
            }

            Admin admin = adminRepository.findByUsername(receivedAdmin.getUsername());
            if (admin == null) {
                res.put("message", "Invalid credentials.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
            }

            if (!admin.getPassword().equals(receivedAdmin.getPassword())) {
                res.put("message", "Invalid credentials.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
            }

            String token = tokenService.generateToken(admin.getUsername(), "admin");
            res.put("token", token);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("message", "Error validating admin.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    /**
     * Filter doctors by name, specialty, and/or time (AM/PM).
     * Delegates to DoctorService methods depending on which params are provided.
     */
    public Map<String, Object> filterDoctor(String name, String specialty, String time) {
        boolean hasName = name != null && !name.isBlank();
        boolean hasSpec = specialty != null && !specialty.isBlank();
        boolean hasTime = time != null && !time.isBlank();

        if (hasName && hasSpec && hasTime) return doctorService.filterDoctorsByNameSpecilityandTime(name, specialty, time);
        if (hasName && hasTime) return doctorService.filterDoctorByNameAndTime(name, time);
        if (hasName && hasSpec) return doctorService.filterDoctorByNameAndSpecility(name, specialty);
        if (hasSpec && hasTime) return doctorService.filterDoctorByTimeAndSpecility(specialty, time);
        if (hasName) return doctorService.findDoctorByName(name);
        if (hasSpec) return doctorService.filterDoctorBySpecility(specialty);
        if (hasTime) return doctorService.filterDoctorsByTime(time);

        // No filters
        Map<String, Object> res = new HashMap<>();
        res.put("doctors", doctorService.getDoctors());
        return res;
    }

    /**
     * Validate that an appointment time is actually available for the doctor on that date.
     *
     * return:
     *  1  -> valid
     *  0  -> unavailable time
     * -1  -> doctor not found
     */
    public int validateAppointment(Appointment appointment) {
        try {
            if (appointment == null || appointment.getDoctor() == null || appointment.getAppointmentTime() == null) {
                return 0;
            }

            Long doctorId = appointment.getDoctor().getId();
            if (doctorId == null) return -1;

            Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
            if (doctorOpt.isEmpty()) return -1;

            LocalDate date = appointment.getAppointmentTime().toLocalDate();
            LocalTime requestedTime = appointment.getAppointmentTime().toLocalTime();

            // available slots are strings like "09:00 AM", etc. (lab format)
            // We compare by exact start time formatting.
            String requested = requestedTime.toString(); // fallback if your slots are "HH:mm"
            for (String slot : doctorService.getDoctorAvailability(doctorId, date)) {
                // Make comparison tolerant: "09:00" matches start of "09:00 AM"
                if (slot != null && slot.startsWith(requested)) {
                    return 1;
                }
            }
            return 0;

        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Validate patient registration uniqueness.
     * true  -> patient does NOT exist yet (ok to register)
     * false -> already exists
     */
    public boolean validatePatient(Patient patient) {
        if (patient == null) return false;
        String email = patient.getEmail();
        String phone = patient.getPhone();

        Patient existing = patientRepository.findByEmailOrPhone(email, phone);
        return existing == null;
    }

    /**
     * Validate patient login (email + password) and return token if correct.
     */
    public ResponseEntity<Map<String, String>> validatePatientLogin(Login login) {
        Map<String, String> res = new HashMap<>();
        try {
            if (login == null || login.getEmail() == null || login.getPassword() == null) {
                res.put("message", "Missing credentials.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
            }

            Patient patient = patientRepository.findByEmail(login.getEmail());
            if (patient == null || !patient.getPassword().equals(login.getPassword())) {
                res.put("message", "Invalid credentials.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
            }

            String token = tokenService.generateToken(patient.getEmail(), "patient");
            res.put("token", token);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("message", "Error validating patient login.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    /**
     * Filter patient appointments by condition and/or doctor name.
     * Uses token to identify the patient (via email inside token).
     */
    public ResponseEntity<Map<String, Object>> filterPatient(String condition, String name, String token) {
        try {
            String email = tokenService.extractUser(token); // assumes your TokenService can do this
            Patient patient = patientRepository.findByEmail(email);

            if (patient == null) {
                Map<String, Object> res = new HashMap<>();
                res.put("message", "Unauthorized.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
            }

            Long patientId = patient.getId();

            boolean hasCond = condition != null && !condition.isBlank();
            boolean hasName = name != null && !name.isBlank();

            if (hasCond && hasName) return patientService.filterByDoctorAndCondition(condition, name, patientId);
            if (hasCond) return patientService.filterByCondition(condition, patientId);
            if (hasName) return patientService.filterByDoctor(name, patientId);

            // No filters: return all appointments for patient
            return patientService.getPatientAppointment(patientId, token);

        } catch (Exception e) {
            Map<String, Object> res = new HashMap<>();
            res.put("message", "Error filtering appointments.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }
}

