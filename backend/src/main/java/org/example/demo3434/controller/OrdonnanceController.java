package org.example.demo3434.controller;

import lombok.RequiredArgsConstructor;
import org.example.demo3434.dto.OrdonnanceDTO;
import org.example.demo3434.service.OrdonnanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medecin/ordonnances")
@CrossOrigin(origins = "http://localhost:5000") // Autorise ton Frontend Vite/React
@RequiredArgsConstructor
public class OrdonnanceController {

    private final OrdonnanceService ordonnanceService;

    @GetMapping
    public ResponseEntity<List<OrdonnanceDTO>> getAllOrdonnances() {
        return ResponseEntity.ok(ordonnanceService.getAllOrdonnances());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdonnanceDTO> getOrdonnanceById(@PathVariable Integer id) {
        return ResponseEntity.ok(ordonnanceService.getOrdonnanceById(id));
    }
}