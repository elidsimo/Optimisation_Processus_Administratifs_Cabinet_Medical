package org.example.demo3434.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.demo3434.dto.FactureDTO;
import org.example.demo3434.entity.*;
import org.example.demo3434.repository.FactureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FactureService {

    private final FactureRepository factureRepository;

    public List<FactureDTO> getAllFactures() {
        return factureRepository.findAllWithDetails().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FactureDTO validerPaiement(Integer id, String modePaiementStr) {
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Facture non trouvée"));

        // Conversion String -> Enum
        try {
            // Mapper CARTE vers CARTE_BANCAIRE si besoin, sinon direct
            String modeEnum = modePaiementStr.equals("CARTE") ? "CARTE_BANCAIRE" : modePaiementStr;
            facture.setModePaiement(ModePaiement.valueOf(modeEnum));
        } catch (IllegalArgumentException e) {
            // Fallback par défaut
            facture.setModePaiement(ModePaiement.ESPECES);
        }

        facture.setStatutFacture(StatutFacture.PAYEE);
        return convertToDTO(factureRepository.save(facture));
    }

    @Transactional
    public FactureDTO annulerFacture(Integer id) {
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Facture non trouvée"));

        facture.setStatutFacture(StatutFacture.ANNULEE);
        return convertToDTO(factureRepository.save(facture));
    }

    // Mapper Entity -> DTO
    private FactureDTO convertToDTO(Facture f) {
        // Navigation sécurisée dans le graphe d'objets (null check simplifié pour l'exemple)
        Consultation c = f.getConsultation();
        Patient p = (c != null && c.getDossierMedical() != null) ? c.getDossierMedical().getPatient() : null;

        return FactureDTO.builder()
                .id(f.getIdFacture())
                .montant(f.getDoubleMontant())
                .statut(f.getStatutFacture().name())
                .modePaiement(f.getModePaiement() != null ? f.getModePaiement().name() : null)
                .consultationId(c != null ? c.getIdConsultation() : null)
                .dateConsultation(c != null ? c.getDateConsultation() : null)
                .patientNom(p != null ? p.getNom() : "")
                .patientPrenom(p != null ? p.getPrenom() : "")
                .patientCin(p != null ? p.getCin() : "")
                .build();
    }
}