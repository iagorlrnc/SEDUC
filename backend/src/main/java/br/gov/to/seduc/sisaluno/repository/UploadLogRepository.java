package br.gov.to.seduc.sisaluno.repository;

import br.gov.to.seduc.sisaluno.entity.UploadLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UploadLogRepository extends JpaRepository<UploadLog, Long> {
    List<UploadLog> findAllByOrderByDataHoraDesc();
}
