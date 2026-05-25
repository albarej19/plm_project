package com.plm.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title       = "PLM Device Lifecycle API",
                version     = "1.0",
                description = "IoT Product Lifecycle Management — Week 1. " +
                        "Use /api/auth/register or /api/auth/login to get a JWT, " +
                        "then click 'Authorize' and paste: Bearer <your_token>"
        )
)
@SecurityScheme(
        name         = "bearerAuth",
        type         = SecuritySchemeType.HTTP,
        scheme       = "bearer",
        bearerFormat = "JWT",
        description  = "Paste your JWT token here (without the 'Bearer' prefix)"
)
public class SwaggerConfig {
    // Configuration is done via annotations above
}