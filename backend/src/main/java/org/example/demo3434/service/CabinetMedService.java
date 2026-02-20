package org.example.demo3434.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.demo3434.dto.ConsultationCreateDTO;
import org.example.demo3434.dto.PrescriptionDTO;
import org.example.demo3434.entity.*;
import org.example.demo3434.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CabinetMedService {

    private final PatientRepository patientRepository;
    private final DossierMedicalRepository dossierRepository;
    private final ConsultationRepository consultationRepository;
    private final MedicamentRepository medicamentRepository;
    private final OrdonnanceMedicamentRepository ordonnanceRepository;
    private final LigneOrdonnanceRepository ligneOrdonnanceRepository;

    // --- GESTION PATIENTS (Page 1) ---
    public List<Patient> getAllPatients(String query) {
        if (query == null || query.isEmpty()) {
            return patientRepository.findAll();
        }
        return patientRepository.searchPatients(query);
    }

    public Patient getPatientById(Integer id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
    }

    public DossierMedical getDossierByPatient(Integer patientId) {
        return dossierRepository.findByPatientId(patientId);
    }

    public List<Consultation> getHistoriqueConsultations(Integer patientId) {
        DossierMedical dossier = dossierRepository.findByPatientId(patientId);
        if (dossier == null) return List.of();
        return consultationRepository.findByDossierMedicalIdDossierOrderByDateConsultationDesc(dossier.getIdDossier());
    }

    // --- GESTION CONSULTATION (Page 2) ---
    public List<Medicament> searchMedicaments(String query) {
        return medicamentRepository.findByNomCommercialContainingIgnoreCase(query);
    }

    @Transactional
    public Consultation createConsultation(ConsultationCreateDTO dto) {
        // 1. Récupérer le dossier
        DossierMedical dossier = dossierRepository.findByPatientId(dto.getPatientId());
        if (dossier == null) {
            // Créer un dossier s'il n'existe pas (optionnel, selon ta logique métier)
            Patient p = patientRepository.findById(dto.getPatientId()).orElseThrow();
            dossier = new DossierMedical();
            dossier.setPatient(p);
            dossier.setDateCreation(LocalDate.now());
            dossier = dossierRepository.save(dossier);
        }

        // 2. Créer la consultation
        Consultation consult = new Consultation();
        consult.setDossierMedical(dossier);
        consult.setDateConsultation(LocalDate.now());
        consult.setTypeConsultation(dto.getTypeConsultation());
        consult.setExamenClinique(dto.getExamenClinique());
        consult.setDiagnostic(dto.getDiagnostic());
        consult.setObservations(dto.getObservations());

        Consultation savedConsult = consultationRepository.save(consult);

        // 3. Gérer l'ordonnance si des médicaments sont prescrits
        if (dto.getPrescriptions() != null && !dto.getPrescriptions().isEmpty()) {
            OrdonnanceMedicament ordonnance = new OrdonnanceMedicament();
            ordonnance.setConsultation(savedConsult);
            ordonnance.setDate(LocalDate.now());
            OrdonnanceMedicament savedOrdo = ordonnanceRepository.save(ordonnance);

            List<LigneOrdonnance> lignes = new ArrayList<>();
            for (PrescriptionDTO pDto : dto.getPrescriptions()) {
                LigneOrdonnance ligne = new LigneOrdonnance();
                ligne.setOrdonnanceMedicament(savedOrdo);
                ligne.setPosologie(pDto.getPosologie());
                ligne.setDuree(pDto.getDuree());

                Medicament med = medicamentRepository.findById(pDto.getMedicamentId())
                        .orElseThrow(() -> new RuntimeException("Médicament inconnu ID: " + pDto.getMedicamentId()));
                ligne.setMedicament(med);

                lignes.add(ligneOrdonnanceRepository.save(ligne));
            }
            savedOrdo.setLignes(lignes);
        }

        return savedConsult;
    }
}