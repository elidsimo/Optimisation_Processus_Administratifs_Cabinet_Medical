package org.example.demo3434.controller;

import org.example.demo3434.dto.CabinetDTO;
import org.example.demo3434.service.CabinetService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/cabinets")
@CrossOrigin(origins = "http://localhost:5000") // Adapte au port de ton React
public class CabinetController {

    private final CabinetService cabinetService;

    public CabinetController(CabinetService cabinetService) {
        this.cabinetService = cabinetService;
    }

    @GetMapping
    public ResponseEntity<List<CabinetDTO>> getAllCabinets() {
        return ResponseEntity.ok(cabinetService.getAllCabinets());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CabinetDTO> createCabinet(
            @RequestParam("nom") String nom,
            @RequestParam("specialite") String specialite,
            @RequestParam("adresse") String adresse,
            @RequestParam("tel") String tel,
            @RequestParam(value = "logo", required = false) MultipartFile logo) throws IOException {

        return ResponseEntity.ok(cabinetService.createCabinet(nom, specialite, adresse, tel, logo));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CabinetDTO> updateCabinet(
            @PathVariable Integer id,
            @RequestParam("nom") String nom,
            @RequestParam("specialite") String specialite,
            @RequestParam("adresse") String adresse,
            @RequestParam("tel") String tel,
            @RequestParam(value = "logo", required = false) MultipartFile logo) throws IOException {

        return ResponseEntity.ok(cabinetService.updateCabinet(id, nom, specialite, adresse, tel, logo));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CabinetDTO> toggleStatus(@PathVariable Integer id) {
        return ResponseEntity.ok(cabinetService.toggleStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCabinet(@PathVariable Integer id) {
        cabinetService.deleteCabinet(id);
        return ResponseEntity.noContent().build();
    }
}