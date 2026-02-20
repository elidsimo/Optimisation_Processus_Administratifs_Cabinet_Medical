package org.example.demo3434.repository;

import org.example.demo3434.entity.OrdonnanceMedicament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdonnanceMedicamentRepository extends JpaRepository<OrdonnanceMedicament, Integer> {}
