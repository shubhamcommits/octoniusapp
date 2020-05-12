package com.octonius.queryservice.controllers;


import com.octonius.queryservice.models.FileModel;
import com.octonius.queryservice.services.FileSearchService;
import com.octonius.queryservice.solr.QueryRequest;
import com.octonius.queryservice.solr.QueryResponse;
import io.swagger.annotations.Api;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/file")
@Api(value = "Files search API")
public class FileSearchController {

    private final FileSearchService fileSearchService;

    public FileSearchController(final FileSearchService fileSearchService) {
        this.fileSearchService = Objects.requireNonNull(fileSearchService, "fileSearchService must not be null!");
    }


    @GetMapping("/{id}")
    ResponseEntity<FileModel> getFileById(@PathVariable String id) {
        return fileSearchService.getFileById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.BAD_REQUEST));
    }

    @PostMapping
    ResponseEntity<QueryResponse<FileModel>> filterByQueryRequest(@RequestBody(required = false) final QueryRequest request) {
        return fileSearchService.filterByQueryRequest(request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.BAD_REQUEST));
    }
}
