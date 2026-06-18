package br.gov.to.seduc.sisaluno.dto;

public class UploadResponseDto {
    private String status;
    private Integer registrosProcessados;
    private String mensagem;
    private String logErros;

    public UploadResponseDto() {}

    public UploadResponseDto(String status, Integer registrosProcessados, String mensagem, String logErros) {
        this.status = status;
        this.registrosProcessados = registrosProcessados;
        this.mensagem = mensagem;
        this.logErros = logErros;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getRegistrosProcessados() {
        return registrosProcessados;
    }

    public void setRegistrosProcessados(Integer registrosProcessados) {
        this.registrosProcessados = registrosProcessados;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
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
        private String status;
        private Integer registrosProcessados;
        private String mensagem;
        private String logErros;

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder registrosProcessados(Integer registrosProcessados) {
            this.registrosProcessados = registrosProcessados;
            return this;
        }

        public Builder mensagem(String mensagem) {
            this.mensagem = mensagem;
            return this;
        }

        public Builder logErros(String logErros) {
            this.logErros = logErros;
            return this;
        }

        public UploadResponseDto build() {
            return new UploadResponseDto(status, registrosProcessados, mensagem, logErros);
        }
    }
}
