package org.example.demo3434.controller;

import org.example.demo3434.dto.DashboardDataDTO;
import org.example.demo3434.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    public AdminDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @SuppressWarnings("NullableProblems")
    @GetMapping
    public ResponseEntity<DashboardDataDTO> getDashboardData() {
        // Retourne toutes les données nécessaires en un seul appel
        // Idéal pour le chargement initial de la page Dashboard React
        return ResponseEntity.ok(dashboardService.getAdminDashboardData());
    }
}