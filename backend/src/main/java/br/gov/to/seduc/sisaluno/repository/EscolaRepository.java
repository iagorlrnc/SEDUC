package br.gov.to.seduc.sisaluno.repository;

import br.gov.to.seduc.sisaluno.entity.Escola;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EscolaRepository extends JpaRepository<Escola, Long> {
    Optional<Escola> findByCodigoInep(String codigoInep);
    Optional<Escola> findByNomeIgnoreCaseAndMunicipioId(String nome, Long municipioId);
    Optional<Escola> findByNomeIgnoreCase(String nome);
}
