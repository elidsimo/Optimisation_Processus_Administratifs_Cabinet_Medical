package org.example.demo3434.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.demo3434.entity.Medicament;
import org.example.demo3434.repository.MedicamentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicamentServiceImpl implements MedicamentService {

    private final MedicamentRepository medicamentRepository;

    @Override
    public List<Medicament> getAllMedicaments() {
        return medicamentRepository.findAll();
    }

    @Override
    public Medicament getMedicamentById(Integer id) {
        return medicamentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Médicament non trouvé avec l'ID : " + id));
    }

    @Override
    public Medicament saveMedicament(Medicament medicament) {
        return medicamentRepository.save(medicament);
    }

    @Override
    public Medicament updateMedicament(Integer id, Medicament medicamentDetails) {
        Medicament existingMedicament = getMedicamentById(id);

        existingMedicament.setNomCommercial(medicamentDetails.getNomCommercial());
        existingMedicament.setDosage(medicamentDetails.getDosage());
        existingMedicament.setForme(medicamentDetails.getForme());

        return medicamentRepository.save(existingMedicament);
    }

    @Override
    public void deleteMedicament(Integer id) {
        if (!medicamentRepository.existsById(id)) {
            throw new EntityNotFoundException("Impossible de supprimer. Médicament introuvable avec l'ID : " + id);
        }
        medicamentRepository.deleteById(id);
    }
}