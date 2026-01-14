package com.project.back_end.mvc;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.project.back_end.services.AppService;

@Controller
public class DashboardController {

    private final AppService service;

    public DashboardController(AppService service) {
        this.service = service;
    }

    @GetMapping("/adminDashboard/{token}")
    public String adminDashboard(@PathVariable String token) {
        ResponseEntity<Map<String, String>> validation = service.validateToken(token, "admin");

        // token valid -> 200 OK with empty body map (per your Service.java design)
        if (validation.getStatusCode().is2xxSuccessful()) {
            return "admin/adminDashboard";
        }

        return "redirect:http://localhost:8080/";
    }

    @GetMapping("/doctorDashboard/{token}")
    public String doctorDashboard(@PathVariable String token) {
        ResponseEntity<Map<String, String>> validation = service.validateToken(token, "doctor");

        if (validation.getStatusCode().is2xxSuccessful()) {
            return "doctor/doctorDashboard";
        }

        return "redirect:http://localhost:8080/";
    }
}
