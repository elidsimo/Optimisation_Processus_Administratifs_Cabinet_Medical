package org.example.demo3434.controller;

import lombok.RequiredArgsConstructor;
import org.example.demo3434.dto.FactureDTO;
import org.example.demo3434.service.FactureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/secretaire/factures")
@CrossOrigin(origins = "http://localhost:5000") // Important pour React
@RequiredArgsConstructor
public class FactureController {

    private final FactureService factureService;

    @GetMapping
    public ResponseEntity<List<FactureDTO>> getAllFactures() {
        return ResponseEntity.ok(factureService.getAllFactures());
    }

    @PutMapping("/{id}/payer")
    public ResponseEntity<FactureDTO> validerPaiement(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        String mode = payload.get("modePaiement");
        return ResponseEntity.ok(factureService.validerPaiement(id, mode));
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<FactureDTO> annulerFacture(@PathVariable Integer id) {
        return ResponseEntity.ok(factureService.annulerFacture(id));
    }
}