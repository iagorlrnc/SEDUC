package br.gov.to.seduc.sisaluno.controller;

import br.gov.to.seduc.sisaluno.dto.AlunoDto;
import br.gov.to.seduc.sisaluno.service.AlunoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alunos")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AlunoController {

    @Autowired
    private AlunoService alunoService;

    @Autowired
    private br.gov.to.seduc.sisaluno.repository.EscolaRepository escolaRepository;

    @Autowired
    private br.gov.to.seduc.sisaluno.repository.SerieRepository serieRepository;

    @Autowired
    private br.gov.to.seduc.sisaluno.repository.MunicipioRepository municipioRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<Page<AlunoDto>> getAlunos(
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) String escola,
            @RequestParam(required = false) String serie,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "nome") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AlunoDto> alunos = alunoService.listAlunos(municipio, escola, serie, search, pageable);
        return ResponseEntity.ok(alunos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<AlunoDto> getAlunoById(@PathVariable Long id) {
        AlunoDto aluno = alunoService.getAlunoById(id);
        return ResponseEntity.ok(aluno);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<AlunoDto> createAluno(@Valid @RequestBody AlunoDto alunoDto) {
        AlunoDto created = alunoService.createAluno(alunoDto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<AlunoDto> updateAluno(@PathVariable Long id, @Valid @RequestBody AlunoDto alunoDto) {
        AlunoDto updated = alunoService.updateAluno(id, alunoDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAluno(@PathVariable Long id) {
        alunoService.deleteAluno(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) String escola,
            @RequestParam(required = false) String serie,
            @RequestParam(required = false) String search) {

        byte[] fileBytes = alunoService.exportExcel(municipio, escola, serie, search);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=alunos_seduc_to.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(fileBytes);
    }

    @GetMapping("/export/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) String escola,
            @RequestParam(required = false) String serie,
            @RequestParam(required = false) String search) {

        byte[] fileBytes = alunoService.exportPdf(municipio, escola, serie, search);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=alunos_seduc_to.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(fileBytes);
    }

    @GetMapping("/escolas")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<java.util.List<br.gov.to.seduc.sisaluno.entity.Escola>> getEscolas() {
        return ResponseEntity.ok(escolaRepository.findAll());
    }

    @GetMapping("/series")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<java.util.List<br.gov.to.seduc.sisaluno.entity.Serie>> getSeries() {
        return ResponseEntity.ok(serieRepository.findAll());
    }

    @GetMapping("/municipios")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<java.util.List<br.gov.to.seduc.sisaluno.entity.Municipio>> getMunicipios() {
        return ResponseEntity.ok(municipioRepository.findAll());
    }
}
