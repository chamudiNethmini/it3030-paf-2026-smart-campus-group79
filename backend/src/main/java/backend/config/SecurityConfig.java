package backend.config;

import backend.security.CustomOAuth2UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final ClientRegistrationRepository clientRegistrationRepository;
    private final String frontendUrl;
    private final CustomOAuth2UserService customOAuth2UserService;

    public SecurityConfig(
            ClientRegistrationRepository clientRegistrationRepository,
            CustomOAuth2UserService customOAuth2UserService,
            @Value("${app.frontend-url:http://localhost:3002}") String frontendUrl
    ) {
        this.clientRegistrationRepository = clientRegistrationRepository;
        this.customOAuth2UserService = customOAuth2UserService;
        this.frontendUrl = frontendUrl;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/", "/login**", "/error", "/ws/**", "/oauth2/**", "/api/auth/**").permitAll()
                        .requestMatchers("/api/resources/**").permitAll()
                        
                        // User endpoints: allow login and get current user publicly
                        .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                        .requestMatchers("/api/users/login").permitAll()
                        .requestMatchers("/api/users/me").permitAll()

                        // Admin specific user management
                        .requestMatchers(HttpMethod.GET, "/api/users/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/role").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/*").hasRole("ADMIN")
                        
                        // All other /api/users/** endpoints require ADMIN role
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // Booking Management
                        .requestMatchers(HttpMethod.PATCH, "/api/bookings/*/status").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/bookings/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/bookings").hasAnyRole("ADMIN", "TECHNICIAN")
                        .requestMatchers("/api/bookings/**").authenticated()

                        // Ticket Management
                        .requestMatchers(HttpMethod.GET, "/api/tickets").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/tickets/*/assign").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/tickets/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/tickets/*/status").hasAnyRole("TECHNICIAN", "ADMIN")
                        .requestMatchers("/api/tickets/**").authenticated()

                        // Notification Management
                        .requestMatchers(HttpMethod.GET, "/api/notifications").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/notifications/unread").hasRole("ADMIN")
                        .requestMatchers("/api/notifications/**").authenticated()

                        // Any other request requires authentication
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .defaultSuccessUrl(frontendUrl + "/oauth-callback", true)
                        .failureHandler((request, response, exception) ->
                                response.sendRedirect(frontendUrl + "/login?error=oauth"))
                )
                .logout(logout -> logout
                        .logoutSuccessUrl(frontendUrl + "/login?logout")
                        .permitAll()
                );

        return http.build();
    }

    // ✅ CORS config for local frontend ports (3000, 3001, 3002, 5173, 5174)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002",
                "http://localhost:5173",
                "http://localhost:5174"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}