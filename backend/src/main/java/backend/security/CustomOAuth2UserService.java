package backend.security;

import backend.entity.Role;
import backend.entity.User;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.*;
import org.springframework.security.oauth2.core.user.*;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User user = super.loadUser(userRequest);

        Map<String, Object> attributes = user.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        User existingUser = userRepository.findByEmail(email);

        if (existingUser == null) {
            User newUser = new User();
            newUser.setName(name);
            newUser.setEmail(email);

            // default role USER
            Role userRole = Role.USER;

            // admin email check - testing
            if (email.equals("gayanthawannisekara@gmail.com")) {
                userRole = Role.ADMIN;
            }

            newUser.setRole(userRole);

            userRepository.save(newUser);
        } else {
            // existing user ගේ role update කරන්න (testing purpose)
            if (email.equals("gayanthawannisekara@gmail.com") && existingUser.getRole() != Role.ADMIN) {
                existingUser.setRole(Role.ADMIN);
                userRepository.save(existingUser);
            }
        }

        return user;
    }
}