package org.example.demo3434.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardDataDTO {
    private StatsDTO stats;
    private List<CabinetSummaryDTO> recentCabinets;
    private List<MedicamentDTO> recentMedicaments;
}