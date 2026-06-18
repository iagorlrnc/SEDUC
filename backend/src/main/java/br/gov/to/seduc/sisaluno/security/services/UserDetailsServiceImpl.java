package br.gov.to.seduc.sisaluno.security.services;

import br.gov.to.seduc.sisaluno.entity.Usuario;
import br.gov.to.seduc.sisaluno.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com username: " + username));

        if (usuario.getApproved() == null || !usuario.getApproved()) {
            throw new org.springframework.security.authentication.DisabledException("Usuário pendente de aprovação pelo administrador.");
        }

        return UserDetailsImpl.build(usuario);
    }
}
