package backend.config;

import backend.security.CustomOAuth2UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Autowired
    private CustomOAuth2UserService oAuth2UserService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/login**", "/error").permitAll()

                        // Resource endpoints allow for testing / frontend connection
                        .requestMatchers("/api/resources/**").permitAll()

                        // existing admin routes
                        .requestMatchers("/api/users/admin/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(oAuth2UserService)
                        )
                        .defaultSuccessUrl("/api/users", true)
                );

        return http.build();
    }
}