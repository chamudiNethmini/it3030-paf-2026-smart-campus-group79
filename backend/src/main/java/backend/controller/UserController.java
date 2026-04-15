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

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @PostMapping
    public User addUser(@RequestBody User user) {
        User savedUser = userService.saveUser(user);

        // 🔔 Notification create කරනවා
        Notification notification = new Notification();
        notification.setMessage("New user " + savedUser.getName() + " registered");
        notificationRepository.save(notification);

        return savedUser;
    }

    @GetMapping
    public List<User> getUsers() {
        return userService.getAllUsers();
    }

    // ✅ NEW - current logged user (FIXED: missing closing brace)
    @GetMapping("/me")
    public Object getCurrentUser(Authentication authentication) {
        return authentication.getPrincipal();
    }  // ← මෙතන closing brace එක තිබුණේ නැහැ

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
}