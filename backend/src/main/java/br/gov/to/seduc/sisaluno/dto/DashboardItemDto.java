package br.gov.to.seduc.sisaluno.dto;

public class DashboardItemDto {
    private String name;
    private Long value;

    public DashboardItemDto() {}

    public DashboardItemDto(String name, Long value) {
        this.name = name;
        this.value = value;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getValue() {
        return value;
    }

    public void setValue(Long value) {
        this.value = value;
    }
}
