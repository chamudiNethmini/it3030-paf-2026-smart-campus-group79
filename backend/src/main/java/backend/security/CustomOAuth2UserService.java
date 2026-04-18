package backend.security;

import backend.entity.Role;
import backend.entity.User;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.*;
import org.springframework.security.oauth2.core.user.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        User existingUser = userRepository.findByEmail(email);

        if (existingUser == null) {
            User newUser = new User();
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setRole(Role.USER);
            existingUser = userRepository.save(newUser);
            System.out.println("✅ New OAuth user created: " + email + " with role: USER");
        } else {
            // Role always comes from the database (set by admin / seed data)
            System.out.println("✅ OAuth user found in DB: " + email + " with role: " + existingUser.getRole());
        }

        User forAuth = userRepository.findByEmail(email);
        if (forAuth == null) {
            forAuth = existingUser;
        }
        Role role = forAuth.getRole() != null ? forAuth.getRole() : Role.USER;

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        String roleAuthority = "ROLE_" + role.name();
        authorities.add(new SimpleGrantedAuthority(roleAuthority));
        
        System.out.println("🔐 Setting authority: " + roleAuthority + " for user: " + email);

        // Return new OAuth2User with updated authorities
        return new DefaultOAuth2User(authorities, attributes, "sub");
    }
}
