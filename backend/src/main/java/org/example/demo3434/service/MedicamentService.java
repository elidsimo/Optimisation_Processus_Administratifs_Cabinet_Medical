package org.example.demo3434.service;

import org.example.demo3434.entity.Medicament;
import java.util.List;

public interface MedicamentService {
    List<Medicament> getAllMedicaments();
    Medicament getMedicamentById(Integer id);
    Medicament saveMedicament(Medicament medicament);
    Medicament updateMedicament(Integer id, Medicament medicamentDetails);
    void deleteMedicament(Integer id);
}