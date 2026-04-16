package backend.config;

import backend.security.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final ClientRegistrationRepository clientRegistrationRepository;

    public SecurityConfig(ClientRegistrationRepository clientRegistrationRepository) {
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CustomOAuth2UserService customOAuth2UserService) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/", "/login**", "/error", "/ws/**", "/oauth2/**", "/api/auth/**").permitAll()
                        .requestMatchers("/api/resources/**").permitAll()
                        // User endpoints: allow login and get current user publicly
                        .requestMatchers("/api/users/login").permitAll()
                        .requestMatchers("/api/users/me").permitAll()
                        // All other /api/users/** endpoints require ADMIN role
                        .requestMatchers("/api/users/**").hasRole("ADMIN")
                        // Any other request requires authentication
                        .anyRequest().authenticated()
                )
                // ✅ FORM LOGIN - email/password login
                .formLogin(form -> form
                        .loginProcessingUrl("/api/auth/login")
                        .usernameParameter("email")
                        .passwordParameter("password")
                        .successHandler((request, response, authentication) -> {
                            response.setContentType("application/json");
                            response.getWriter().write("{\"message\":\"Login successful\"}");
                            response.setStatus(200);
                        })
                        .failureHandler((request, response, exception) -> {
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Invalid credentials\"}");
                            response.setStatus(401);
                        })
                        .permitAll()
                )
                // ✅ OAUTH2 LOGIN - Google login with custom resolver
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(auth -> auth
                                .authorizationRequestResolver(
                                        new CustomOAuth2AuthorizationRequestResolver(
                                                clientRegistrationRepository,
                                                "/oauth2/authorization"
                                        )
                                )
                        )
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .defaultSuccessUrl("http://localhost:3001/oauth-callback", true)
                )
                // ✅ LOGOUT
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setContentType("application/json");
                            response.getWriter().write("{\"message\":\"Logout successful\"}");
                            response.setStatus(200);
                        })
                        .permitAll()
                );

        return http.build();
    }

    // ✅ CORS config — frontend localhost:3000 සහ 3001 allow කරනවා
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:3001"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}