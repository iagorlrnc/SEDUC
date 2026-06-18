package br.gov.to.seduc.sisaluno.controller;

import br.gov.to.seduc.sisaluno.entity.Usuario;
import br.gov.to.seduc.sisaluno.entity.Role;
import br.gov.to.seduc.sisaluno.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<Usuario>> getPendingUsers() {
        List<Usuario> pendingUsers = usuarioRepository.findByApprovedFalseOrderByNomeAsc();
        // Limpar senhas por questões de segurança
        pendingUsers.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(pendingUsers);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Usuario>> getActiveUsers() {
        List<Usuario> activeUsers = usuarioRepository.findByApprovedTrueOrderByNomeAsc();
        // Limpar senhas por questões de segurança
        activeUsers.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(activeUsers);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com id: " + id));

        String roleStr = request.get("role");
        if (roleStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "O tipo de acesso (role) é obrigatório."));
        }

        try {
            Role role = Role.valueOf(roleStr.toUpperCase());
            usuario.setRole(role);
            usuario.setApproved(true);
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(Map.of("message", "Usuário aprovado com sucesso com perfil " + roleStr));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Perfil inválido. Perfis permitidos: ADMIN, OPERATOR, VIEWER."));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com id: " + id));

        usuarioRepository.delete(usuario);
        return ResponseEntity.ok(Map.of("message", "Solicitação rejeitada e usuário removido com sucesso."));
    }
}
