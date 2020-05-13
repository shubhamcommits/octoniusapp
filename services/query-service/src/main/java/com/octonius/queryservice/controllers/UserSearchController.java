package com.octonius.queryservice.controllers;

import com.octonius.queryservice.models.UserModel;
import com.octonius.queryservice.services.UserSearchService;
import com.octonius.queryservice.solr.QueryRequest;
import com.octonius.queryservice.solr.QueryResponse;
import io.swagger.annotations.Api;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/user")
@Api(value = "Users search API")
public class UserSearchController {
    private final UserSearchService userSearchService;

    public UserSearchController(final UserSearchService userSearchService) {
        this.userSearchService = Objects.requireNonNull(userSearchService, "userSearchService must not be null!");
    }

    @GetMapping("/{id}")
    ResponseEntity<UserModel> getUserById(@PathVariable String id) {
        return userSearchService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.BAD_REQUEST));
    }

    @PostMapping
    ResponseEntity<QueryResponse<UserModel>> filterByQueryRequest(@RequestBody(required = false) final QueryRequest request) {
        return userSearchService.filterByQueryRequest(request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.BAD_REQUEST));
    }
}
