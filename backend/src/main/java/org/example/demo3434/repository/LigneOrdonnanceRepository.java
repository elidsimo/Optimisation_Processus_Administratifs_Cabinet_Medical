package org.example.demo3434.repository;

import org.example.demo3434.entity.LigneOrdonnance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LigneOrdonnanceRepository extends JpaRepository<LigneOrdonnance, Integer> {}