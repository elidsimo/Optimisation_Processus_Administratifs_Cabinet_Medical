package org.example.demo3434.service;

import org.example.demo3434.dto.OrdonnanceDTO;
import java.util.List;

public interface OrdonnanceService {
    List<OrdonnanceDTO> getAllOrdonnances();
    OrdonnanceDTO getOrdonnanceById(Integer id);
}