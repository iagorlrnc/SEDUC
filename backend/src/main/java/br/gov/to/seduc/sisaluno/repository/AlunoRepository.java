package br.gov.to.seduc.sisaluno.repository;

import br.gov.to.seduc.sisaluno.entity.Aluno;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {

    Optional<Aluno> findByCpf(String cpf);

    @Query("SELECT a FROM Aluno a WHERE " +
           "(:municipio IS NULL OR LOWER(a.escola.municipio.nome) = LOWER(CAST(:municipio AS string))) AND " +
           "(:escola IS NULL OR LOWER(a.escola.nome) = LOWER(CAST(:escola AS string))) AND " +
           "(:serie IS NULL OR LOWER(a.serie.nome) = LOWER(CAST(:serie AS string))) AND " +
           "(:search IS NULL OR LOWER(a.nome) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR REPLACE(REPLACE(a.cpf, '.', ''), '-', '') LIKE CONCAT('%', CAST(:search AS string), '%') " +
           "OR LOWER(a.escola.nome) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(a.escola.municipio.nome) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    Page<Aluno> findFiltered(
        @Param("municipio") String municipio,
        @Param("escola") String escola,
        @Param("serie") String serie,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT a FROM Aluno a WHERE " +
           "(:municipio IS NULL OR LOWER(a.escola.municipio.nome) = LOWER(CAST(:municipio AS string))) AND " +
           "(:escola IS NULL OR LOWER(a.escola.nome) = LOWER(CAST(:escola AS string))) AND " +
           "(:serie IS NULL OR LOWER(a.serie.nome) = LOWER(CAST(:serie AS string))) AND " +
           "(:search IS NULL OR LOWER(a.nome) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR REPLACE(REPLACE(a.cpf, '.', ''), '-', '') LIKE CONCAT('%', CAST(:search AS string), '%') " +
           "OR LOWER(a.escola.nome) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(a.escola.municipio.nome) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    List<Aluno> findFilteredList(
        @Param("municipio") String municipio,
        @Param("escola") String escola,
        @Param("serie") String serie,
        @Param("search") String search
    );

    @Query("SELECT a.escola.municipio.nome, COUNT(a) FROM Aluno a GROUP BY a.escola.municipio.nome")
    List<Object[]> countAlunosPorMunicipio();

    @Query("SELECT a.escola.nome, COUNT(a) FROM Aluno a GROUP BY a.escola.nome")
    List<Object[]> countAlunosPorEscola();

    @Query("SELECT a.serie.nome, COUNT(a) FROM Aluno a GROUP BY a.serie.nome")
    List<Object[]> countAlunosPorSerie();

    @Query("SELECT a.sexo, COUNT(a) FROM Aluno a GROUP BY a.sexo")
    List<Object[]> countAlunosPorSexo();

    @Query("SELECT a.dataNascimento FROM Aluno a")
    List<LocalDate> findAllBirthdates();

    List<Aluno> findByUploadLogId(Long uploadLogId);

    void deleteByUploadLogId(Long uploadLogId);
}

