package backend.security;

import backend.entity.Role;
import backend.entity.User;
import backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Loads users for Spring Security form login ({@code /api/auth/login}) so the session
 * matches {@code /api/users/me} and ticket APIs can read the logged-in user.
 */
@Service
public class DbUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public DbUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username);
        if (user == null) {
            throw new UsernameNotFoundException("No user for email: " + username);
        }
        String pwd = user.getPassword() != null ? user.getPassword() : "";
        Role role = user.getRole() != null ? user.getRole() : Role.USER;
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password("{noop}" + pwd)
                .roles(role.name())
                .build();
    }
}
