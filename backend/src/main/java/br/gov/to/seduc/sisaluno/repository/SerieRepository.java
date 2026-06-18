package br.gov.to.seduc.sisaluno.repository;

import br.gov.to.seduc.sisaluno.entity.Serie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SerieRepository extends JpaRepository<Serie, Long> {
    Optional<Serie> findByNomeIgnoreCase(String nome);
}
