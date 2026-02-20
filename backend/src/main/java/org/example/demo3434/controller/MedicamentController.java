package org.example.demo3434.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.demo3434.entity.Medicament;
import org.example.demo3434.service.MedicamentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicaments")
@CrossOrigin(origins = "http://localhost:5000") // Ajuste selon le port de ton React
@RequiredArgsConstructor
public class MedicamentController {

    private final MedicamentService medicamentService;

    // GET /api/medicaments
    @GetMapping
    public ResponseEntity<List<Medicament>> getAllMedicaments() {
        return ResponseEntity.ok(medicamentService.getAllMedicaments());
    }

    // GET /api/medicaments/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Medicament> getMedicamentById(@PathVariable Integer id) {
        return ResponseEntity.ok(medicamentService.getMedicamentById(id));
    }

    // POST /api/medicaments
    @PostMapping
    public ResponseEntity<Medicament> createMedicament(@Valid @RequestBody Medicament medicament) {
        Medicament createdMedicament = medicamentService.saveMedicament(medicament);
        return new ResponseEntity<>(createdMedicament, HttpStatus.CREATED);
    }

    // PUT /api/medicaments/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Medicament> updateMedicament(@PathVariable Integer id, @Valid @RequestBody Medicament medicament) {
        return ResponseEntity.ok(medicamentService.updateMedicament(id, medicament));
    }

    // DELETE /api/medicaments/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicament(@PathVariable Integer id) {
        medicamentService.deleteMedicament(id);
        return ResponseEntity.noContent().build();
    }
}