package com.octonius.queryservice.controllers;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Api(value = "HealthController", description = "Operations allowed to find the application status health")
public class HealthController {

    @GetMapping("/status/health")
    @ApiOperation(value = "Get status health", response = ResponseEntity.class)
    public ResponseEntity<String> statusHealth() {
        return ResponseEntity.ok("OK");
    }
}
