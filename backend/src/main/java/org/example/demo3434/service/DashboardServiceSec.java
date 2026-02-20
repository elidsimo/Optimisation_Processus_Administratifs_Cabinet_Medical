package org.example.demo3434.service;

import org.example.demo3434.dto.DashboardStatsDTO;
import org.example.demo3434.dto.RendezVousDTO;
import org.example.demo3434.entity.*;
import org.example.demo3434.repository.*;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceSec {

    private final PatientRepository patientRepository;
    private final RendezVousRepository rendezVousRepository;
    private final FactureRepository factureRepository;
    private final SecretaireRepository secretaireRepository;

    // Méthode utilitaire pour récupérer l'ID du cabinet
    private Integer getCabinetIdFromSecretaire(Long secretaireId) {
        Secretaire secretaire = secretaireRepository.findById(secretaireId)
                .orElseThrow(() -> new RuntimeException("Secrétaire non trouvée"));

        if (secretaire.getCabinet() == null) {
            throw new RuntimeException("Cette secrétaire n'est rattachée à aucun cabinet");
        }
        return secretaire.getCabinet().getId();
    }

    public DashboardStatsDTO getStats(Long secretaireId) {
        Integer cabinetId = getCabinetIdFromSecretaire(secretaireId);

        return DashboardStatsDTO.builder()
                .totalPatients(patientRepository.countByCabinet_Id(cabinetId))
                .totalRdv(rendezVousRepository.countByMedecin_Cabinet_Id(cabinetId))
                .rdvEnAttente(rendezVousRepository.countByMedecin_Cabinet_IdAndStatutRdv(cabinetId, StatutRdv.EN_ATTENTE))
                .facturesPayees(factureRepository.countBySecretaire_Cabinet_IdAndStatutFacture(cabinetId, StatutFacture.PAYEE))
                .build();
    }

    public List<RendezVousDTO> getUpcomingAppointments(Long secretaireId) {
        Integer cabinetId = getCabinetIdFromSecretaire(secretaireId);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        List<RendezVous> rdvs = rendezVousRepository.findRdvTodayByCabinet(cabinetId, startOfDay, endOfDay);

        return rdvs.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private RendezVousDTO mapToDTO(RendezVous rdv) {
        String patientName = (rdv.getPatient() != null)
                ? rdv.getPatient().getNom() + " " + rdv.getPatient().getPrenom()
                : "Inconnu";
        String phone = (rdv.getPatient() != null) ? rdv.getPatient().getNumTel() : "";

        String statusDto = switch (rdv.getStatutRdv()) {
            case CONFIRME -> "confirmed";
            case EN_ATTENTE -> "waiting";
            case ANNULE -> "cancelled";
            default -> "pending";
        };

        return RendezVousDTO.builder()
                .id(rdv.getIdRendezVous())
                .patientName(patientName)
                .time(rdv.getDateRdv().format(DateTimeFormatter.ofPattern("HH:mm")))
                .phone(phone)
                .status(statusDto)
                .build();
    }
}