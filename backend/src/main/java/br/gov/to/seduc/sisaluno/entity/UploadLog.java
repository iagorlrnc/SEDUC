package br.gov.to.seduc.sisaluno.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "upload_logs")
public class UploadLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String usuario;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Column(name = "tipo_arquivo", nullable = false)
    private String tipoArquivo;

    @Column(name = "registros_processados", nullable = false)
    private Integer registrosProcessados;

    @Column(nullable = false)
    private String status;

    @Column(name = "log_erros", columnDefinition = "TEXT")
    private String logErros;

    @PrePersist
    protected void onCreate() {
        dataHora = LocalDateTime.now();
    }

    public UploadLog() {}

    public UploadLog(Long id, String usuario, LocalDateTime dataHora, String tipoArquivo, 
                     Integer registrosProcessados, String status, String logErros) {
        this.id = id;
        this.usuario = usuario;
        this.dataHora = dataHora;
        this.tipoArquivo = tipoArquivo;
        this.registrosProcessados = registrosProcessados;
        this.status = status;
        this.logErros = logErros;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public String getTipoArquivo() {
        return tipoArquivo;
    }

    public void setTipoArquivo(String tipoArquivo) {
        this.tipoArquivo = tipoArquivo;
    }

    public Integer getRegistrosProcessados() {
        return registrosProcessados;
    }

    public void setRegistrosProcessados(Integer registrosProcessados) {
        this.registrosProcessados = registrosProcessados;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLogErros() {
        return logErros;
    }

    public void setLogErros(String logErros) {
        this.logErros = logErros;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String usuario;
        private LocalDateTime dataHora;
        private String tipoArquivo;
        private Integer registrosProcessados;
        private String status;
        private String logErros;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder usuario(String usuario) { this.usuario = usuario; return this; }
        public Builder dataHora(LocalDateTime dataHora) { this.dataHora = dataHora; return this; }
        public Builder tipoArquivo(String tipoArquivo) { this.tipoArquivo = tipoArquivo; return this; }
        public Builder registrosProcessados(Integer registrosProcessados) { this.registrosProcessados = registrosProcessados; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder logErros(String logErros) { this.logErros = logErros; return this; }

        public UploadLog build() {
            return new UploadLog(id, usuario, dataHora, tipoArquivo, registrosProcessados, status, logErros);
        }
    }
}
