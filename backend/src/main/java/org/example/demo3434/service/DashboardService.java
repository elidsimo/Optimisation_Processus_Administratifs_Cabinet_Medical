package org.example.demo3434.service;

import org.example.demo3434.dto.*;
import org.example.demo3434.entity.Cabinet;
import org.example.demo3434.entity.Medicament;
import org.example.demo3434.repository.CabinetRepository;
import org.example.demo3434.repository.MedicamentRepository;
import org.example.demo3434.repository.UtilisateurRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final CabinetRepository cabinetRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final MedicamentRepository medicamentRepo;

    public DashboardService(CabinetRepository cabinetRepo,
                            UtilisateurRepository utilisateurRepo,
                            MedicamentRepository medicamentRepo) {
        this.cabinetRepo = cabinetRepo;
        this.utilisateurRepo = utilisateurRepo;
        this.medicamentRepo = medicamentRepo;
    }

    public DashboardDataDTO getAdminDashboardData() {
        // 1. Récupérer les stats
        long activeCabs = cabinetRepo.countByEstActifTrue();
        long inactiveCabs = cabinetRepo.countByEstActifFalse();
        long totalUsers = utilisateurRepo.count();
        long totalMeds = medicamentRepo.count();

        StatsDTO stats = StatsDTO.builder()
                .cabinetsActifs(activeCabs)
                .cabinetsInactifs(inactiveCabs)
                .utilisateurs(totalUsers)
                .medicaments(totalMeds)
                .build();

        // 2. Récupérer les 5 derniers cabinets
        List<Cabinet> cabinets = cabinetRepo.findAllByOrderByIdDesc(PageRequest.of(0, 5));
        List<CabinetSummaryDTO> cabinetDTOs = cabinets.stream().map(this::mapToCabinetDTO).collect(Collectors.toList());

        // 3. Récupérer les 5 derniers médicaments
        List<Medicament> meds = medicamentRepo.findAllByOrderByIdDesc(PageRequest.of(0, 5));
        List<MedicamentDTO> medDTOs = meds.stream().map(this::mapToMedicamentDTO).collect(Collectors.toList());

        return DashboardDataDTO.builder()
                .stats(stats)
                .recentCabinets(cabinetDTOs)
                .recentMedicaments(medDTOs)
                .build();
    }

    // --- Mappers privés ---

    private CabinetSummaryDTO mapToCabinetDTO(Cabinet cabinet) {

        int userCount = 0;
        if (cabinet.getMedecins() != null) userCount += cabinet.getMedecins().size();
        if (cabinet.getSecretaires() != null) userCount += cabinet.getSecretaires().size();

        String logoUrl = null;
        if (cabinet.getLogo() != null && !cabinet.getLogo().isEmpty()) {
            logoUrl = "http://localhost:8080/api/admin/cabinets/logos/" + cabinet.getLogo();
        }

        // Extraction simple de la ville depuis l'adresse
        String ville = "Inconnue";
        if (cabinet.getAdresse() != null && !cabinet.getAdresse().isEmpty()) {
            String[] parts = cabinet.getAdresse().split(" ");
            ville = parts[parts.length - 1];
        }

        return CabinetSummaryDTO.builder()
                .id(cabinet.getId())
                .name(cabinet.getNom())
                .specialite(cabinet.getSpecialite() != null
                        ? cabinet.getSpecialite().name()
                        : "N/A")
                .ville(ville)
                .status(cabinet.isEstActif() ? "active" : "inactive")
                .users(userCount)
                .logoUrl(logoUrl)
                .build();
    }


    private MedicamentDTO mapToMedicamentDTO(Medicament med) {
        return MedicamentDTO.builder()
                .id(med.getId())
                .nom(med.getNomCommercial())
                .dosage(med.getDosage())
                .forme(med.getForme())
                .build();
    }
}