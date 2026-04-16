package backend.controller;

import backend.entity.Notification;
import backend.entity.User;
import backend.entity.Role;
import backend.repository.NotificationRepository;
import backend.repository.UserRepository;
import backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;


@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public User addUser(@RequestBody User user) {
        User savedUser = userService.saveUser(user);

        Notification notification = new Notification();
        notification.setMessage("New user " + savedUser.getName() + " registered");
        notificationRepository.save(notification);

        // 🔥 SEND REAL-TIME VIA WEBSOCKET
        messagingTemplate.convertAndSend("/topic/notifications", notification);

        return savedUser;
    }

    @GetMapping
    public List<User> getUsers() {
        return userService.getAllUsers();
    }

    // ✅ Current logged user with email, name and role
    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(Authentication authentication) {

        Map<String, Object> userData = new HashMap<>();

        if (authentication != null && authentication.getPrincipal() != null) {

            Object principal = authentication.getPrincipal();

            if (principal instanceof org.springframework.security.oauth2.core.user.OAuth2User oAuth2User) {

                String email = oAuth2User.getAttribute("email");
                String name = oAuth2User.getAttribute("name");

                // 🔥 DB eke user eka hoyagannawa - findByEmail returns User directly (not Optional)
                User foundUser = userRepository.findByEmail(email);

                String role = "USER";

                if (foundUser != null) {
                    role = foundUser.getRole().name();
                }

                userData.put("email", email);
                userData.put("name", name);
                userData.put("role", role);
            }
        }

        return userData;
    }

    @GetMapping("/admin")
    public String adminOnly() {
        return "Admin access granted!";
    }

    @GetMapping("/admin/{id}")
    public String adminOnlyById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);

        if (user.isPresent()) {
            if (user.get().getRole() == Role.ADMIN) {
                return "Admin access granted!";
            } else {
                return "Access denied! Not an admin.";
            }
        }

        return "User not found!";
    }

    // ✅ Login endpoint - merged into class
    @PostMapping("/login")
    public User login(@RequestBody User user) {

        User existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser != null && existingUser.getPassword().equals(user.getPassword())) {
            return existingUser;
        }

        throw new RuntimeException("Invalid credentials");
    }

}