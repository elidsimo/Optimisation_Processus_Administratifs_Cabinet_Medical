package org.example.demo3434.controller;

import lombok.RequiredArgsConstructor;
import org.example.demo3434.dto.RendezVousLiteDTO;
import org.example.demo3434.entity.StatutRdv;
import org.example.demo3434.service.RendezVousService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rendez-vous")
@RequiredArgsConstructor
public class RendezVousController {

    private final RendezVousService rdvService;

    // GET /api/rendez-vous?secretaireId=1&date=2023-10-25
    @GetMapping
    public ResponseEntity<List<RendezVousLiteDTO>> getRendezVous(
            @RequestParam Long secretaireId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        // Si aucune date n'est fournie, on prend aujourd'hui
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(rdvService.getRendezVousByDate(secretaireId, targetDate));
    }

    // POST /api/rendez-vous?secretaireId=1
    @PostMapping
    public ResponseEntity<RendezVousLiteDTO> createRendezVous(
            @RequestParam Long secretaireId,
            @RequestBody RendezVousLiteDTO dto) {
        return ResponseEntity.ok(rdvService.createRendezVous(secretaireId, dto));
    }

    // PUT /api/rendez-vous/15
    @PutMapping("/{id}")
    public ResponseEntity<RendezVousLiteDTO> updateRendezVous(
            @PathVariable Integer id,
            @RequestBody RendezVousLiteDTO dto) {
        return ResponseEntity.ok(rdvService.updateRendezVous(id, dto));
    }

    // PATCH /api/rendez-vous/15/statut?statut=ANNULE
    @PatchMapping("/{id}/statut")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Integer id,
            @RequestParam StatutRdv statut) {
        rdvService.updateStatus(id, statut);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/rendez-vous/15
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRendezVous(@PathVariable Integer id) {
        rdvService.deleteRendezVous(id);
        return ResponseEntity.noContent().build();
    }
}