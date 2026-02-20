package org.example.demo3434.controller;

import lombok.RequiredArgsConstructor;
import org.example.demo3434.dto.ConsultationCreateDTO;
import org.example.demo3434.entity.Consultation;
import org.example.demo3434.entity.DossierMedical;
import org.example.demo3434.entity.Medicament;
import org.example.demo3434.entity.Patient;
import org.example.demo3434.service.CabinetMedService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medecin/consulatation")
@CrossOrigin(origins = "http://localhost:5000") // Autorise ton frontend Vite/React
@RequiredArgsConstructor
public class CabinetMedController {

    private final CabinetMedService cabinetService;

    // --- Endpoint Page 1 : Liste Patients ---

    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getPatients(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(cabinetService.getAllPatients(query));
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<Patient> getPatient(@PathVariable Integer id) {
        return ResponseEntity.ok(cabinetService.getPatientById(id));
    }

    @GetMapping("/patients/{id}/dossier")
    public ResponseEntity<DossierMedical> getDossier(@PathVariable Integer id) {
        return ResponseEntity.ok(cabinetService.getDossierByPatient(id));
    }

    @GetMapping("/patients/{id}/consultations")
    public ResponseEntity<List<Consultation>> getHistorique(@PathVariable Integer id) {
        return ResponseEntity.ok(cabinetService.getHistoriqueConsultations(id));
    }

    // --- Endpoint Page 2 : Consultation ---

    @GetMapping("/medicaments")
    public ResponseEntity<List<Medicament>> searchMedicaments(@RequestParam String query) {
        return ResponseEntity.ok(cabinetService.searchMedicaments(query));
    }

    @PostMapping("/consultations")
    public ResponseEntity<Consultation> createConsultation(@RequestBody ConsultationCreateDTO dto) {
        Consultation newConsultation = cabinetService.createConsultation(dto);
        return ResponseEntity.ok(newConsultation);
    }
}