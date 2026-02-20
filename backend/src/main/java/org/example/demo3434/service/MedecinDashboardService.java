package org.example.demo3434.service;


import jakarta.transaction.Transactional;
import org.example.demo3434.dto.MedecinDashboardDTO;
import org.example.demo3434.dto.RecentConsultationDTO;
import org.example.demo3434.dto.WaitingPatientDTO;
import org.example.demo3434.entity.StatutRdv;
import org.example.demo3434.repository.ConsultationRepository;
import org.example.demo3434.repository.OrdonnanceRepository;
import org.example.demo3434.repository.RendezVousRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedecinDashboardService {

    @Autowired
    private RendezVousRepository rdvRepo;
    @Autowired private ConsultationRepository consultationRepo;
    @Autowired private OrdonnanceRepository ordonnanceRepo;

    public MedecinDashboardDTO getDashboardData(Long medecinId) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();

        MedecinDashboardDTO dto = new MedecinDashboardDTO();

        // 1. Stats
        dto.setNbConsultationsToday(consultationRepo.countByRendezVousMedecinIdAndDateConsultation(medecinId, today));
        dto.setNbPatientsAttente(rdvRepo.countByMedecinIdAndStatutRdvAndDateRdvAfter(medecinId, StatutRdv.EN_ATTENTE, startOfDay));
        dto.setNbOrdonnancesEmises(ordonnanceRepo.countByConsultationRendezVousMedecinIdAndDate(medecinId, today));
        dto.setNbDossiersMisAJour(dto.getNbConsultationsToday()); // Exemple logique

        // 2. Patients en attente
        dto.setWaitingPatients(rdvRepo.findByMedecinIdAndStatutRdvOrderByDateRdvAsc(medecinId, StatutRdv.EN_ATTENTE)
                .stream().map(rdv -> new WaitingPatientDTO(
                        rdv.getIdRendezVous(),
                        rdv.getPatient().getNom() + " " + rdv.getPatient().getPrenom(),
                        Period.between(rdv.getPatient().getDateNaissance(), LocalDate.now()).getYears(),
                        rdv.getMotif(),
                        Duration.between(rdv.getDateRdv(), LocalDateTime.now()).toMinutes() + " min",
                        rdv.getMotif().toLowerCase().contains("urgent") ? "high" : "normal"
                )).collect(Collectors.toList()));

        // 3. Consultations récentes
        dto.setRecentConsultations(consultationRepo.findTop5ByRendezVousMedecinIdOrderByDateConsultationDesc(medecinId)
                .stream().map(c -> new RecentConsultationDTO(
                        c.getIdConsultation(),
                        c.getRendezVous().getPatient().getNom(),
                        c.getDiagnostic(),
                        c.getDateConsultation().toString()
                )).collect(Collectors.toList()));

        return dto;
    }
}