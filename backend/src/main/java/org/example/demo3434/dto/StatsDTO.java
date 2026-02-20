package org.example.demo3434.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StatsDTO {
    private long cabinetsActifs;
    private long utilisateurs;
    private long medicaments;
    private long cabinetsInactifs;
}
