package org.example.demo3434.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.demo3434.dto.PatientDTO;
import org.example.demo3434.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    // GET /api/patients?secretaireId=1
    @GetMapping
    public ResponseEntity<List<PatientDTO>> getAllPatients(@RequestParam Long secretaireId) {
        return ResponseEntity.ok(patientService.getAllPatients(secretaireId));
    }

    // POST /api/patients?secretaireId=1
    @PostMapping
    public ResponseEntity<PatientDTO> createPatient(
            @RequestParam Long secretaireId,
            @Valid @RequestBody PatientDTO patientDTO) {
        return ResponseEntity.ok(patientService.createPatient(secretaireId, patientDTO));
    }

    // PUT /api/patients/{id}
    @PutMapping("/{id}")
    public ResponseEntity<PatientDTO> updatePatient(
            @PathVariable Integer id,
            @Valid @RequestBody PatientDTO patientDTO) {
        return ResponseEntity.ok(patientService.updatePatient(id, patientDTO));
    }

    // DELETE /api/patients/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Integer id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
}