package br.gov.to.seduc.sisaluno.repository;

import br.gov.to.seduc.sisaluno.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
    List<Usuario> findByApprovedFalseOrderByNomeAsc();
    List<Usuario> findByApprovedTrueOrderByNomeAsc();
    boolean existsByUsername(String username);
}
