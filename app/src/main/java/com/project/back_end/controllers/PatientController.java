package com.project.back_end.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Patient;
import com.project.back_end.services.PatientService;
import com.project.back_end.services.Service;

@RestController
@RequestMapping("/patient")
public class PatientController {

    private final PatientService patientService;
    private final Service service;

    public PatientController(PatientService patientService, Service service) {
        this.patientService = patientService;
        this.service = service;
    }

    // 1) Get Patient Details
    // GET /patient/{token}
    @GetMapping("/{token}")
    public ResponseEntity<Map<String, Object>> getPatientDetails(@PathVariable String token) {
        ResponseEntity<Map<String, String>> tokenCheck = service.validateToken(token, "patient");
        if (tokenCheck.getBody() != null && !tokenCheck.getBody().isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.putAll(tokenCheck.getBody());
            return ResponseEntity.status(tokenCheck.getStatusCode()).body(err);
        }
        return patientService.getPatientDetails(token);
    }

    // 2) Create a New Patient (Signup)
    // POST /patient
    @PostMapping
    public ResponseEntity<Map<String, String>> createPatient(@RequestBody Patient patient) {
        try {
            boolean isValidNewPatient = service.validatePatient(patient); // true => doesn't exist
            if (!isValidNewPatient) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Patient with email id or phone no already exist"));
            }

            int created = patientService.createPatient(patient);
            if (created == 1) {
                return ResponseEntity.status(HttpStatus.CREATED)
                        .body(Map.of("message", "Signup successful"));
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error"));
        }
    }

    // 3) Patient Login
    // POST /patient/login
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Login login) {
        return service.validatePatientLogin(login);
    }

    // 4) Get Patient Appointments
    // GET /patient/{id}/{token}
    @GetMapping("/{id}/{token}")
    public ResponseEntity<Map<String, Object>> getPatientAppointments(
            @PathVariable Long id,
            @PathVariable String token
    ) {
        ResponseEntity<Map<String, String>> tokenCheck = service.validateToken(token, "patient");
        if (tokenCheck.getBody() != null && !tokenCheck.getBody().isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.putAll(tokenCheck.getBody());
            return ResponseEntity.status(tokenCheck.getStatusCode()).body(err);
        }
        return patientService.getPatientAppointment(id, token);
    }

    // 5) Filter Patient Appointments
    // GET /patient/filter/{condition}/{name}/{token}
    @GetMapping("/filter/{condition}/{name}/{token}")
    public ResponseEntity<Map<String, Object>> filterPatientAppointments(
            @PathVariable String condition,
            @PathVariable String name,
            @PathVariable String token
    ) {
        ResponseEntity<Map<String, String>> tokenCheck = service.validateToken(token, "patient");
        if (tokenCheck.getBody() != null && !tokenCheck.getBody().isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.putAll(tokenCheck.getBody());
            return ResponseEntity.status(tokenCheck.getStatusCode()).body(err);
        }

        // normalize frontend "null" path segment
        String cond = ("null".equalsIgnoreCase(condition) || condition.isBlank()) ? null : condition;
        String doctorName = ("null".equalsIgnoreCase(name) || name.isBlank()) ? null : name;

        return service.filterPatient(cond, doctorName, token);
    }
}



