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

            // ✅ Auto-assign roles based on email patterns (customizable)
            Role assignedRole = Role.USER;  // Default role

            // Admin list
            if (email.equals("gayanthawannisekara@gmail.com")) {
                assignedRole = Role.ADMIN;
            }
            // Technician list (can expand)
            else if (email.endsWith("@technicians.com") || email.equals("tech@campus.edu")) {
                assignedRole = Role.TECHNICIAN;
            }

            newUser.setRole(assignedRole);
            existingUser = userRepository.save(newUser);
            System.out.println("✅ New OAuth user created: " + email + " with role: " + assignedRole);
        } else {
            // Update role if admin email
            if (email.equals("gayanthawannisekara@gmail.com") && existingUser.getRole() != Role.ADMIN) {
                existingUser.setRole(Role.ADMIN);
                userRepository.save(existingUser);
                System.out.println("✅ Updated OAuth user role to ADMIN: " + email);
            }
            System.out.println("✅ OAuth user already exists: " + email + " with role: " + existingUser.getRole());
        }

        // 🔥 SET PROPER AUTHORITIES BASED ON ROLE
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        // Add role authority (Spring expects "ROLE_" prefix)
        String roleAuthority = "ROLE_" + existingUser.getRole().name();
        authorities.add(new SimpleGrantedAuthority(roleAuthority));

        System.out.println("🔐 Setting authority: " + roleAuthority + " for user: " + email);

        // Return new OAuth2User with updated authorities
        return new DefaultOAuth2User(authorities, attributes, "sub");
    }
}
