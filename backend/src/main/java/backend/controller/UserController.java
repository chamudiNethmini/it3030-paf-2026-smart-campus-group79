package backend.controller;

import backend.entity.Notification;
import backend.entity.User;
import backend.entity.Role;
import backend.repository.NotificationRepository;
import backend.repository.UserRepository;
import backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
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

    // ✅ Get all users for admin
    @GetMapping("/all")
    public List<User> getAllUsersAdmin() {
        return userService.getAllUsers();
    }

    // ✅ Current logged user with email, name, role and id
    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(Authentication authentication) {

        Map<String, Object> userData = new HashMap<>();

        if (authentication == null) {
            System.out.println("❌ Auth is NULL - User not authenticated");
            return userData;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof OAuth2User oAuth2User) {
            // ✅ Google OAuth2 Login
            System.out.println("✅ OAuth2User detected");

            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");

            // 🔥 AUTO-CREATE USER IF NOT EXISTS
            User foundUser = userRepository.findByEmail(email);
            if (foundUser == null) {
                System.out.println("🔥 New Google user - saving to DB: " + email);
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setName(name);
                newUser.setRole(Role.USER);
                foundUser = userRepository.save(newUser);
            }

            userData.put("id", foundUser.getId());
            userData.put("email", foundUser.getEmail());
            userData.put("name", foundUser.getName());
            userData.put("role", foundUser.getRole().name());

        } else {
            // ✅ Form-based Login (email/password)
            System.out.println("✅ Form-based login detected");

            String email = authentication.getName();
            User foundUser = userRepository.findByEmail(email);

            if (foundUser != null) {
                userData.put("id", foundUser.getId());
                userData.put("email", foundUser.getEmail());
                userData.put("name", foundUser.getName());
                userData.put("role", foundUser.getRole().name());
            } else {
                System.out.println("❌ No user found for email: " + email);
            }
        }

        System.out.println("✅ Returning userData: " + userData);
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

    // ✅ Login endpoint (Form-based)
    @PostMapping("/login")
    public User login(@RequestBody User user) {
        User existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser != null && existingUser.getPassword().equals(user.getPassword())) {
            return existingUser;
        }

        throw new RuntimeException("Invalid credentials");
    }

    // ✅ Update user role (ADMIN only)
    @PutMapping("/{id}/role")
    public User updateUserRole(@PathVariable Long id, @RequestParam String role) {
        User user = userRepository.findById(id).orElseThrow();
        user.setRole(Role.valueOf(role));
        return userRepository.save(user);
    }

    // ✅ Delete user (ADMIN only)
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }
}