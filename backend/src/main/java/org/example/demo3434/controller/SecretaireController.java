package org.example.demo3434.controller;

import org.example.demo3434.dto.DashboardStatsDTO;
import org.example.demo3434.dto.RendezVousDTO;
import org.example.demo3434.service.DashboardServiceSec;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/secretaire")
@RequiredArgsConstructor
public class SecretaireController {

    private final DashboardServiceSec dashboardService;

    // Exemple appel: GET /api/secretaire/stats?id=1
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(@RequestParam Long id) {
        return ResponseEntity.ok(dashboardService.getStats(id));
    }

    // Exemple appel: GET /api/secretaire/appointments?id=1
    @GetMapping("/appointments")
    public ResponseEntity<List<RendezVousDTO>> getAppointmentsToday(@RequestParam Long id) {
        return ResponseEntity.ok(dashboardService.getUpcomingAppointments(id));
    }
}