package org.example.demo3434.repository;

import org.example.demo3434.entity.DossierMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DossierMedicalRepository extends JpaRepository<DossierMedical, Integer> {
    DossierMedical findByPatientId(Integer patientId);
}