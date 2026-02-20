package org.example.demo3434.dto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDTO {
    private long totalPatients;
    private long totalRdv; // Total ou Aujourd'hui
    private long rdvEnAttente;
    private long facturesPayees;
}