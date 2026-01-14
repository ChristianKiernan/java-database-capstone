package com.project.back_end.controllers;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Doctor;
import com.project.back_end.services.DoctorService;
import com.project.back_end.services.Service;

@RestController
@RequestMapping("${api.path}" + "doctor")
public class DoctorController {

    private final DoctorService doctorService;
    private final Service service;

    public DoctorController(DoctorService doctorService, Service service) {
        this.doctorService = doctorService;
        this.service = service;
    }

    // 1) Get Doctor Availability
    // GET /{api.path}doctor/availability/{user}/{doctorId}/{date}/{token}
    @GetMapping("/availability/{user}/{doctorId}/{date}/{token}")
    public ResponseEntity<Map<String, Object>> getDoctorAvailability(
            @PathVariable String user,
            @PathVariable Long doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable String token
    ) {
        ResponseEntity<Map<String, String>> tokenCheck = service.validateToken(token, user);
        if (tokenCheck.getBody() != null && !tokenCheck.getBody().isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.putAll(tokenCheck.getBody());
            return ResponseEntity.status(tokenCheck.getStatusCode()).body(err);
        }

        List<String> availability = doctorService.getDoctorAvailability(doctorId, date);
        return ResponseEntity.ok(Map.of("availability", availability));
    }

    // 2) Get List of Doctors
    // GET /{api.path}doctor
    @GetMapping
    public ResponseEntity<Map<String, Object>> getDoctors() {
        List<Doctor> doctors = doctorService.getDoctors();
        return ResponseEntity.ok(Map.of("doctors", doctors));
    }

    // 3) Add New Doctor (admin only)
    // POST /{api.path}doctor/{token}
    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> saveDoctor(
            @PathVariable String token,
            @RequestBody Doctor doctor
    ) {
        ResponseEntity<Map<String, String>> tokenCheck = service.validateToken(token, "admin");
        if (tokenCheck.getBody() != null && !tokenCheck.getBody().isEmpty()) {
            return tokenCheck;
        }

        int saved = doctorService.saveDoctor(doctor);
        if (saved == 1) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Doctor added to db"));
        }
        if (saved == -1) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Doctor already exists"));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Some internal error occurred"));
    }

    // 4) Doctor Login
    // POST /{api.path}doctor/login
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> doctorLogin(@RequestBody Login login) {
        return doctorService.validateDoctor(login);
    }

    // 5) Update Doctor Details (admin only)
    // PUT /{api.path}doctor/{token}
    @PutMapping("/{token}")
    public ResponseEntity<Map<String, String>> updateDoctor(
            @PathVariable String token,
            @RequestBody Doctor doctor
    ) {
        ResponseEntity<Map<String, String>> tokenCheck = service.validateToken(token, "admin");
        if (tokenCheck.getBody() != null && !tokenCheck.getBody().isEmpty()) {
            return tokenCheck;
        }

        int updated = doctorService.updateDoctor(doctor);
        if (updated == 1) {
            return ResponseEntity.ok(Map.of("message", "Doctor updated"));
        }
        if (updated == -1) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Doctor not found"));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Some internal error occurred"));
    }

    // 6) Delete Doctor (admin only)
    // DELETE /{api.path}doctor/{id}/{token}
    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String, String>> deleteDoctor(
            @PathVariable long id,
            @PathVariable String token
    ) {
        ResponseEntity<Map<String, String>> tokenCheck = service.validateToken(token, "admin");
        if (tokenCheck.getBody() != null && !tokenCheck.getBody().isEmpty()) {
            return tokenCheck;
        }

        int deleted = doctorService.deleteDoctor(id);
        if (deleted == 1) {
            return ResponseEntity.ok(Map.of("message", "Doctor deleted successfully"));
        }
        if (deleted == -1) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Doctor not found with id"));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Some internal error occurred"));
    }

    // 7) Filter Doctors
    // GET /{api.path}doctor/filter/{name}/{time}/{speciality}
    @GetMapping("/filter/{name}/{time}/{speciality}")
    public ResponseEntity<Map<String, Object>> filterDoctors(
            @PathVariable String name,
            @PathVariable String time,
            @PathVariable String speciality
    ) {
        // Normalize optional "null" path segments coming from frontend
        String n = ("null".equalsIgnoreCase(name) || name.isBlank()) ? null : name;
        String t = ("null".equalsIgnoreCase(time) || time.isBlank()) ? null : time;
        String s = ("null".equalsIgnoreCase(speciality) || speciality.isBlank()) ? null : speciality;

        Map<String, Object> result = service.filterDoctor(n, s, t);
        return ResponseEntity.ok(result);
    }
}
