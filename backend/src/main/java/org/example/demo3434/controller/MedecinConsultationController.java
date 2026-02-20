package org.example.demo3434.controller;

import org.example.demo3434.dto.ConsultationDTO;
import org.example.demo3434.service.MedecinConsultationService;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/medecin/consultations")
@RequiredArgsConstructor
// Permet à ton React (localhost:5173 ou 3000) d'appeler le backend (localhost:8080)
@CrossOrigin(origins = "http://localhost:5000")
public class MedecinConsultationController {

    private final MedecinConsultationService consultationService;

    @GetMapping
    public List<ConsultationDTO> getAllConsultations(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return consultationService.searchConsultations(search);
        }
        return consultationService.getAllConsultations();
    }

    // Tu peux ajouter d'autres méthodes ici (POST, PUT, DELETE)
}