package br.gov.to.seduc.sisaluno.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.regex.Pattern;

public class EtlUtils {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );

    /**
     * Valida CPF com algoritmo oficial dos dígitos verificadores.
     */
    public static boolean isValidCpf(String cpf) {
        if (cpf == null) return false;
        String cleanCpf = cpf.replaceAll("\\D", "");
        
        if (cleanCpf.length() != 11) return false;

        // Rejeita CPFs com todos os dígitos iguais (11111111111, etc)
        if (cleanCpf.matches("(\\d)\\1{10}")) return false;

        try {
            // Primeiro dígito verificador
            int sum = 0;
            for (int i = 0; i < 9; i++) {
                sum += (cleanCpf.charAt(i) - '0') * (10 - i);
            }
            int r1 = 11 - (sum % 11);
            int d1 = (r1 > 9) ? 0 : r1;

            // Segundo dígito verificador
            sum = 0;
            for (int i = 0; i < 10; i++) {
                sum += (cleanCpf.charAt(i) - '0') * (11 - i);
            }
            int r2 = 11 - (sum % 11);
            int d2 = (r2 > 9) ? 0 : r2;

            return (cleanCpf.charAt(9) - '0' == d1) && (cleanCpf.charAt(10) - '0' == d2);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Valida formato do E-mail.
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) return false;
        return EMAIL_PATTERN.matcher(email.trim()).matches();
    }

    /**
     * Formata um nome em Title Case (Ex: "joão DA silva  " -> "João da Silva").
     */
    public static String formatName(String name) {
        if (name == null) return "";
        String clean = name.trim().replaceAll("\\s+", " ");
        if (clean.isEmpty()) return "";

        String[] words = clean.toLowerCase().split(" ");
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < words.length; i++) {
            String word = words[i];
            if (i > 0) sb.append(" ");
            
            // Ignora preposições brasileiras comuns em minúsculo
            if (word.equals("de") || word.equals("da") || word.equals("do") || 
                word.equals("dos") || word.equals("das") || word.equals("e")) {
                sb.append(word);
            } else if (word.length() > 0) {
                sb.append(Character.toUpperCase(word.charAt(0)))
                  .append(word.substring(1));
            }
        }
        return sb.toString();
    }

    /**
     * Tenta fazer parse de uma data a partir de múltiplos formatos brasileiros e ISO comuns.
     */
    public static LocalDate parseLocalDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) return null;
        String val = dateStr.trim();
        
        String[] formats = {"dd/MM/yyyy", "yyyy-MM-dd", "dd-MM-yyyy", "yyyy/MM/dd"};
        for (String format : formats) {
            try {
                return LocalDate.parse(val, DateTimeFormatter.ofPattern(format));
            } catch (DateTimeParseException ignored) {}
        }
        return null;
    }

    /**
     * Calcula um ano de nascimento aproximado se o aluno só fornecer a idade.
     */
    public static LocalDate deriveBirthdateFromAge(int age) {
        int currentYear = LocalDate.now().getYear();
        return LocalDate.of(currentYear - age, 1, 1);
    }
}
