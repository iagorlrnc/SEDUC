package br.gov.to.seduc.sisaluno.controller;

import br.gov.to.seduc.sisaluno.dto.UploadResponseDto;
import br.gov.to.seduc.sisaluno.entity.Aluno;
import br.gov.to.seduc.sisaluno.entity.UploadLog;
import br.gov.to.seduc.sisaluno.repository.AlunoRepository;
import br.gov.to.seduc.sisaluno.repository.UploadLogRepository;
import br.gov.to.seduc.sisaluno.service.UploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UploadController {

    @Autowired
    private UploadService uploadService;

    @Autowired
    private UploadLogRepository uploadLogRepository;

    @Autowired
    private AlunoRepository alunoRepository;

    @PostMapping(value = "/json", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<UploadResponseDto> uploadJson(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        
        String username = authentication != null ? authentication.getName() : "sistema";
        UploadResponseDto response = uploadService.processJson(file.getInputStream(), username);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/sql", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<UploadResponseDto> uploadSql(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        
        String username = authentication != null ? authentication.getName() : "sistema";
        UploadResponseDto response = uploadService.processSql(file.getInputStream(), username);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/xml", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<UploadResponseDto> uploadXml(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        
        String username = authentication != null ? authentication.getName() : "sistema";
        UploadResponseDto response = uploadService.processXml(file.getInputStream(), username);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/xlsx", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<UploadResponseDto> uploadXlsx(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        
        String username = authentication != null ? authentication.getName() : "sistema";
        UploadResponseDto response = uploadService.processXlsx(file.getInputStream(), username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<List<UploadLog>> getLogs() {
        List<UploadLog> logs = uploadLogRepository.findAllByOrderByDataHoraDesc();
        return ResponseEntity.ok(logs);
    }

    @DeleteMapping("/logs/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteUploadLog(@PathVariable Long id) {
        try {
            // Busca o log de upload
            UploadLog uploadLog = uploadLogRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Log de upload não encontrado"));

            // Deleta todos os alunos associados a este upload
            List<Aluno> alunos = alunoRepository.findByUploadLogId(id);
            int deletedCount = alunos.size();
            alunoRepository.deleteByUploadLogId(id);

            // Deleta o log de upload
            uploadLogRepository.deleteById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Upload e dados associados deletados com sucesso");
            response.put("deletedAlunos", deletedCount);
            response.put("uploadLogId", id);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Erro ao deletar upload: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
