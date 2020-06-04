package com.octonius.queryservice.controllers;

import com.octonius.queryservice.models.PostModel;
import com.octonius.queryservice.services.PostSearchService;
import com.octonius.queryservice.solr.QueryRequest;
import com.octonius.queryservice.solr.QueryResponse;
import io.swagger.annotations.Api;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/post")
@Api(value = "Posts search API")
public class PostSearchController {
    private final PostSearchService postSearchService;

    public PostSearchController(final PostSearchService postSearchService) {
        this.postSearchService = Objects.requireNonNull(postSearchService, "postSearchService must not be null!");
    }

    @GetMapping("/{id}")
    ResponseEntity<PostModel> getPostById(@PathVariable String id) {
        return postSearchService.getPostById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.BAD_REQUEST));
    }

    @PostMapping
    ResponseEntity<QueryResponse<PostModel>> filterByQueryRequest(@RequestBody(required = false) final QueryRequest request) {
        return postSearchService.filterByQueryRequest(request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.BAD_REQUEST));
    }
}
