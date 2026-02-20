package org.example.demo3434.dto;

import lombok.Data;

import java.util.List;

@Data
public class MedecinDashboardDTO {
    private long nbConsultationsToday;
    private long nbPatientsAttente;
    private long nbOrdonnancesEmises;
    private long nbDossiersMisAJour;
    private List<WaitingPatientDTO> waitingPatients;
    private List<RecentConsultationDTO> recentConsultations;
}