package br.gov.to.seduc.sisaluno.util;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

public class EtlUtilsTest {

    @Test
    public void testIsValidCpf() {
        // CPFs válidos conhecidos (gerados/fictícios)
        assertTrue(EtlUtils.isValidCpf("12345678909"));
        assertTrue(EtlUtils.isValidCpf("123.456.789-09"));
        assertTrue(EtlUtils.isValidCpf("52998224725"));

        // CPFs inválidos
        assertFalse(EtlUtils.isValidCpf(null));
        assertFalse(EtlUtils.isValidCpf(""));
        assertFalse(EtlUtils.isValidCpf("123"));
        assertFalse(EtlUtils.isValidCpf("11111111111")); // todos iguais
        assertFalse(EtlUtils.isValidCpf("12345678900")); // dígito verificador incorreto
    }

    @Test
    public void testIsValidEmail() {
        assertTrue(EtlUtils.isValidEmail("aluno@escola.to.gov.br"));
        assertTrue(EtlUtils.isValidEmail("joao.silva@gmail.com"));
        
        assertFalse(EtlUtils.isValidEmail(null));
        assertFalse(EtlUtils.isValidEmail(""));
        assertFalse(EtlUtils.isValidEmail("aluno@escola"));
        assertFalse(EtlUtils.isValidEmail("joao.silva.gmail.com"));
    }

    @Test
    public void testFormatName() {
        assertEquals("João da Silva", EtlUtils.formatName("  joão  DA   silva  "));
        assertEquals("Maria do Carmo dos Santos", EtlUtils.formatName("maria do carmo dos santos"));
        assertEquals("Ana de Souza", EtlUtils.formatName("ANA DE SOUZA"));
        assertEquals("", EtlUtils.formatName(null));
        assertEquals("", EtlUtils.formatName("  "));
    }

    @Test
    public void testParseLocalDate() {
        assertEquals(LocalDate.of(2008, 5, 15), EtlUtils.parseLocalDate("15/05/2008"));
        assertEquals(LocalDate.of(2008, 5, 15), EtlUtils.parseLocalDate("2008-05-15"));
        assertNull(EtlUtils.parseLocalDate(null));
        assertNull(EtlUtils.parseLocalDate("data_invalida"));
    }
}
