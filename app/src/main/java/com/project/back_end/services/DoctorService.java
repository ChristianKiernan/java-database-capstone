package com.project.back_end.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final TokenService tokenService;

    public DoctorService(
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            TokenService tokenService
    ) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.tokenService = tokenService;
    }

    /**
     * Fetch available slots for a doctor on a given date by removing booked slots
     * from the doctor's configured availableTimes.
     */
    @Transactional(readOnly = true)
    public List<String> getDoctorAvailability(Long doctorId, LocalDate date) {
        Optional<Doctor> docOpt = doctorRepository.findById(doctorId);
        if (docOpt.isEmpty()) return Collections.emptyList();

        Doctor doctor = docOpt.get();

        // Build day range
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay().minusNanos(1);

        // Fetch appointments for the doctor on that day
        List<Appointment> appts = appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(doctorId, start, end);

        // Collect booked times as strings like "HH:mm" (or adjust to match your availableTimes format)
        Set<String> booked = appts.stream()
                .map(Appointment::getAppointmentTime)
                .filter(Objects::nonNull)
                .map(LocalDateTime::toLocalTime)
                .map(t -> String.format("%02d:%02d", t.getHour(), t.getMinute()))
                .collect(Collectors.toSet());

        // Doctor.availableTimes is assumed to be a List<String> (common in this lab)
        List<String> available = doctor.getAvailableTimes() == null ? new ArrayList<>() : new ArrayList<>(doctor.getAvailableTimes());

        // Remove booked slots
        return available.stream()
                .filter(slot -> !booked.contains(normalizeTimeString(slot)))
                .collect(Collectors.toList());
    }

    /**
     * Save a doctor.
     * @return 1 success, -1 already exists, 0 internal error
     */
    @Transactional
    public int saveDoctor(Doctor doctor) {
        try {
            if (doctor == null || doctor.getEmail() == null) return 0;

            Doctor existing = doctorRepository.findByEmail(doctor.getEmail());
            if (existing != null) return -1;

            doctorRepository.save(doctor);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Update a doctor.
     * @return 1 success, -1 not found, 0 internal error
     */
    @Transactional
    public int updateDoctor(Doctor doctor) {
        try {
            if (doctor == null || doctor.getId() == null) return 0;

            if (doctorRepository.findById(doctor.getId()).isEmpty()) return -1;

            doctorRepository.save(doctor);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    @Transactional(readOnly = true)
    public List<Doctor> getDoctors() {
        return doctorRepository.findAll();
    }

    /**
     * Delete doctor and their appointments.
     * @return 1 success, -1 not found, 0 internal error
     */
    @Transactional
    public int deleteDoctor(long id) {
        try {
            Optional<Doctor> docOpt = doctorRepository.findById(id);
            if (docOpt.isEmpty()) return -1;

            // Remove all appointments tied to this doctor first
            appointmentRepository.deleteAllByDoctorId(id);

            doctorRepository.deleteById(id);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Validate doctor login. Returns token if valid.
     */
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, String>> validateDoctor(Login login) {
        Map<String, String> res = new HashMap<>();

        try {
            if (login == null || login.getEmail() == null || login.getPassword() == null) {
                res.put("message", "Missing credentials.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
            }

            Doctor doctor = doctorRepository.findByEmail(login.getEmail());
            if (doctor == null) {
                res.put("message", "Invalid credentials.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
            }

            // NOTE: This lab often uses plain-text passwords. If your project hashes passwords,
            // replace this with a password encoder check.
            if (!Objects.equals(doctor.getPassword(), login.getPassword())) {
                res.put("message", "Invalid credentials.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
            }

            String token = tokenService.generateToken(doctor.getId(), "doctor");
            res.put("token", token);
            res.put("message", "Login successful.");
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("message", "Login failed.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> findDoctorByName(String name) {
        Map<String, Object> res = new HashMap<>();

        String pattern = (name == null) ? "%" : "%" + name + "%";
        List<Doctor> doctors = doctorRepository.findByNameLike(pattern);

        res.put("doctors", doctors);
        return res;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorsByNameSpecilityandTime(String name, String specialty, String amOrPm) {
        Map<String, Object> res = new HashMap<>();

        String safeName = name == null ? "" : name;
        String safeSpec = specialty == null ? "" : specialty;

        List<Doctor> doctors = doctorRepository.findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(safeName, safeSpec);
        doctors = filterDoctorByTime(doctors, amOrPm);

        res.put("doctors", doctors);
        return res;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorByNameAndTime(String name, String amOrPm) {
        Map<String, Object> res = new HashMap<>();

        String pattern = (name == null) ? "%" : "%" + name + "%";
        List<Doctor> doctors = doctorRepository.findByNameLike(pattern);
        doctors = filterDoctorByTime(doctors, amOrPm);

        res.put("doctors", doctors);
        return res;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorByNameAndSpecility(String name, String specilty) {
        Map<String, Object> res = new HashMap<>();

        String safeName = name == null ? "" : name;
        String safeSpec = specilty == null ? "" : specilty;

        List<Doctor> doctors = doctorRepository.findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(safeName, safeSpec);

        res.put("doctors", doctors);
        return res;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorByTimeAndSpecility(String specilty, String amOrPm) {
        Map<String, Object> res = new HashMap<>();

        String safeSpec = specilty == null ? "" : specilty;
        List<Doctor> doctors = doctorRepository.findBySpecialtyIgnoreCase(safeSpec);
        doctors = filterDoctorByTime(doctors, amOrPm);

        res.put("doctors", doctors);
        return res;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorBySpecility(String specilty) {
        Map<String, Object> res = new HashMap<>();

        String safeSpec = specilty == null ? "" : specilty;
        List<Doctor> doctors = doctorRepository.findBySpecialtyIgnoreCase(safeSpec);

        res.put("doctors", doctors);
        return res;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorsByTime(String amOrPm) {
        Map<String, Object> res = new HashMap<>();

        List<Doctor> doctors = doctorRepository.findAll();
        doctors = filterDoctorByTime(doctors, amOrPm);

        res.put("doctors", doctors);
        return res;
    }

    /**
     * Filter doctors list by AM/PM availability.
     * Assumes doctor.getAvailableTimes() returns List<String> like "09:00", "14:30", etc.
     */
    private List<Doctor> filterDoctorByTime(List<Doctor> doctors, String amOrPm) {
        if (amOrPm == null || amOrPm.isBlank()) return doctors;

        String target = amOrPm.trim().toUpperCase(Locale.ROOT);

        return doctors.stream()
                .filter(d -> d.getAvailableTimes() != null && !d.getAvailableTimes().isEmpty())
                .filter(d -> d.getAvailableTimes().stream().anyMatch(slot -> isSlotInAmPm(slot, target)))
                .collect(Collectors.toList());
    }

    private boolean isSlotInAmPm(String slot, String amOrPm) {
        try {
            // Try parse "HH:mm"
            String normalized = normalizeTimeString(slot);
            LocalTime t = LocalTime.parse(normalized);
            return ("AM".equals(amOrPm) && t.getHour() < 12) || ("PM".equals(amOrPm) && t.getHour() >= 12);
        } catch (Exception e) {
            // If parsing fails, fall back to simple string contains check
            return slot != null && slot.toUpperCase(Locale.ROOT).contains(amOrPm);
        }
    }

    private String normalizeTimeString(String slot) {
        if (slot == null) return "";
        String s = slot.trim();

        // If time includes seconds, strip to HH:mm
        // e.g. "09:00:00" -> "09:00"
        if (s.matches("^\\d{2}:\\d{2}:\\d{2}$")) {
            return s.substring(0, 5);
        }
        return s;
    }
}

