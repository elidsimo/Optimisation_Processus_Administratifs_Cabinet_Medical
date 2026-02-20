package org.example.demo3434.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.demo3434.dto.PatientLiteDTO;
import org.example.demo3434.dto.RendezVousLiteDTO;
import org.example.demo3434.entity.*;
import org.example.demo3434.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RendezVousService {

    private final RendezVousLiteRepository rdvRepository;
    private final SecretaireRepository secretaireRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;

    // --- Helpers ---
    private Cabinet getCabinetFromSecretaire(Long secretaireId) {
        Secretaire sec = secretaireRepository.findById(secretaireId)
                .orElseThrow(() -> new EntityNotFoundException("Secrétaire introuvable"));
        if (sec.getCabinet() == null) throw new IllegalStateException("Secrétaire sans cabinet");
        return sec.getCabinet();
    }

    // --- LISTER PAR DATE ---
    public List<RendezVousLiteDTO> getRendezVousByDate(Long secretaireId, LocalDate date) {
        Integer cabinetId = getCabinetFromSecretaire(secretaireId).getId();

        // Définir le début et la fin de la journée (00:00 à 23:59)
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        return rdvRepository.findByCabinetAndDateRange(cabinetId, start, end).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // --- CRÉER ---
    @Transactional
    public RendezVousLiteDTO createRendezVous(Long secretaireId, RendezVousLiteDTO dto) {
        Cabinet cabinet = getCabinetFromSecretaire(secretaireId);

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient introuvable"));

        // Simplification : On assigne le premier médecin du cabinet si non spécifié
        // Dans un vrai cas, on choisirait le médecin spécifique
        Medecin medecin;
        if (dto.getMedecinId() != null) {
            medecin = medecinRepository.findById(dto.getMedecinId())
                    .orElseThrow(() -> new EntityNotFoundException("Médecin introuvable"));
        } else {
            // Fallback : prendre un médecin du cabinet
            medecin = cabinet.getMedecins().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("Aucun médecin dans ce cabinet"));
        }

        RendezVous rdv = new RendezVous();
        rdv.setDateRdv(dto.getDateRdv());
        rdv.setMotif(dto.getMotif());
        rdv.setNotes(dto.getNotes());
        rdv.setStatutRdv(StatutRdv.CONFIRME); // Par défaut
        rdv.setPatient(patient);
        rdv.setMedecin(medecin);

        return mapToDTO(rdvRepository.save(rdv));
    }

    // --- MODIFIER ---
    @Transactional
    public RendezVousLiteDTO updateRendezVous(Integer id, RendezVousLiteDTO dto) {
        RendezVous rdv = rdvRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("RDV introuvable"));

        rdv.setDateRdv(dto.getDateRdv());
        rdv.setMotif(dto.getMotif());
        rdv.setNotes(dto.getNotes());

        // Mise à jour du patient si changé
        if (dto.getPatientId() != null && !dto.getPatientId().equals(rdv.getPatient().getId())) {
            Patient p = patientRepository.findById(dto.getPatientId())
                    .orElseThrow(() -> new EntityNotFoundException("Patient introuvable"));
            rdv.setPatient(p);
        }

        return mapToDTO(rdvRepository.save(rdv));
    }

    // --- CHANGER STATUT ---
    @Transactional
    public void updateStatus(Integer id, StatutRdv statut) {
        RendezVous rdv = rdvRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("RDV introuvable"));
        rdv.setStatutRdv(statut);
        rdvRepository.save(rdv);
    }

    // --- SUPPRIMER ---
    public void deleteRendezVous(Integer id) {
        if (!rdvRepository.existsById(id)) throw new EntityNotFoundException("RDV introuvable");
        rdvRepository.deleteById(id);
    }

    // --- MAPPER ---
    private RendezVousLiteDTO mapToDTO(RendezVous rdv) {
        PatientLiteDTO pDto = null;
        if (rdv.getPatient() != null) {
            pDto = PatientLiteDTO.builder()
                    .id(rdv.getPatient().getId())
                    .nom(rdv.getPatient().getNom())
                    .prenom(rdv.getPatient().getPrenom())
                    .cin(rdv.getPatient().getCin())
                    .numTel(rdv.getPatient().getNumTel())
                    .build();
        }

        return RendezVousLiteDTO.builder()
                .id(rdv.getIdRendezVous()) // Attention au nom du champ dans l'entité
                .dateRdv(rdv.getDateRdv())
                .motif(rdv.getMotif())
                .notes(rdv.getNotes())
                .statut(rdv.getStatutRdv())
                .patient(pDto)
                .patientId(rdv.getPatient() != null ? rdv.getPatient().getId() : null)
                .medecinId(rdv.getMedecin() != null ? rdv.getMedecin().getId().intValue() : null)
                .build();
    }
}