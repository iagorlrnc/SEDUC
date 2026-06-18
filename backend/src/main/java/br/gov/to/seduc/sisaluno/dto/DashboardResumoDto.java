package br.gov.to.seduc.sisaluno.dto;

public class DashboardResumoDto {
    private Long totalAlunos;
    private Long totalEscolas;
    private Long totalMunicipios;
    private Double mediaIdade;
    private String insightsIa;

    public DashboardResumoDto() {}

    public DashboardResumoDto(Long totalAlunos, Long totalEscolas, Long totalMunicipios, Double mediaIdade, String insightsIa) {
        this.totalAlunos = totalAlunos;
        this.totalEscolas = totalEscolas;
        this.totalMunicipios = totalMunicipios;
        this.mediaIdade = mediaIdade;
        this.insightsIa = insightsIa;
    }

    public Long getTotalAlunos() {
        return totalAlunos;
    }

    public void setTotalAlunos(Long totalAlunos) {
        this.totalAlunos = totalAlunos;
    }

    public Long getTotalEscolas() {
        return totalEscolas;
    }

    public void setTotalEscolas(Long totalEscolas) {
        this.totalEscolas = totalEscolas;
    }

    public Long getTotalMunicipios() {
        return totalMunicipios;
    }

    public void setTotalMunicipios(Long totalMunicipios) {
        this.totalMunicipios = totalMunicipios;
    }

    public Double getMediaIdade() {
        return mediaIdade;
    }

    public void setMediaIdade(Double mediaIdade) {
        this.mediaIdade = mediaIdade;
    }

    public String getInsightsIa() {
        return insightsIa;
    }

    public void setInsightsIa(String insightsIa) {
        this.insightsIa = insightsIa;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long totalAlunos;
        private Long totalEscolas;
        private Long totalMunicipios;
        private Double mediaIdade;
        private String insightsIa;

        public Builder totalAlunos(Long totalAlunos) {
            this.totalAlunos = totalAlunos;
            return this;
        }

        public Builder totalEscolas(Long totalEscolas) {
            this.totalEscolas = totalEscolas;
            return this;
        }

        public Builder totalMunicipios(Long totalMunicipios) {
            this.totalMunicipios = totalMunicipios;
            return this;
        }

        public Builder mediaIdade(Double mediaIdade) {
            this.mediaIdade = mediaIdade;
            return this;
        }

        public Builder insightsIa(String insightsIa) {
            this.insightsIa = insightsIa;
            return this;
        }

        public DashboardResumoDto build() {
            return new DashboardResumoDto(totalAlunos, totalEscolas, totalMunicipios, mediaIdade, insightsIa);
        }
    }
}
