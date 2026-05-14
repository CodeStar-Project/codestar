package com.codestar.backend.security;

import com.codestar.backend.repository.IUserRepository;
import com.codestar.backend.utils.Emails;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final IUserRepository userRepository;

    public UserDetailsServiceImpl(IUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String normalized = Emails.normalize(email);
        return userRepository.findByEmail(normalized)
                .map(AuthenticatedUser::new)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
    }
}
