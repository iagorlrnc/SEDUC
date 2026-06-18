package br.gov.to.seduc.sisaluno.controller;

import br.gov.to.seduc.sisaluno.dto.DashboardItemDto;
import br.gov.to.seduc.sisaluno.dto.DashboardResumoDto;
import br.gov.to.seduc.sisaluno.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/resumo")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<DashboardResumoDto> getResumo() {
        return ResponseEntity.ok(dashboardService.getResumo());
    }

    @GetMapping("/alunos-por-municipio")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<List<DashboardItemDto>> getAlunosPorMunicipio() {
        return ResponseEntity.ok(dashboardService.getAlunosPorMunicipio());
    }

    @GetMapping("/alunos-por-escola")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<List<DashboardItemDto>> getAlunosPorEscola() {
        return ResponseEntity.ok(dashboardService.getAlunosPorEscola());
    }

    @GetMapping("/alunos-por-serie")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<List<DashboardItemDto>> getAlunosPorSerie() {
        return ResponseEntity.ok(dashboardService.getAlunosPorSerie());
    }

    @GetMapping("/faixa-etaria")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<List<DashboardItemDto>> getFaixaEtaria() {
        return ResponseEntity.ok(dashboardService.getFaixaEtaria());
    }
}
