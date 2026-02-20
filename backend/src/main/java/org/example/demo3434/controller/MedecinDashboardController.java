package org.example.demo3434.controller;

import org.example.demo3434.dto.MedecinDashboardDTO;
import org.example.demo3434.service.MedecinDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medecin")
@CrossOrigin(origins = "http://localhost:5000") // Port par défaut de Vite/React
public class MedecinDashboardController {

    @Autowired
    private MedecinDashboardService dashboardService;

    @GetMapping("/dashboard/{id}")
    public ResponseEntity<MedecinDashboardDTO> getDashboard(@PathVariable Long id) {
        return ResponseEntity.ok(dashboardService.getDashboardData(id));
    }
}