package com.octonius.queryservice.controllers;

import com.octonius.queryservice.models.FileModel;
import com.octonius.queryservice.models.PostModel;
import com.octonius.queryservice.models.UserModel;
import com.octonius.queryservice.services.UserIndexingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Objects;

@RestController
@RequestMapping("/indexing")
public class IndexingController {
    private final UserIndexingService userIndexingService;

    public IndexingController(final UserIndexingService userIndexingService) {
        this.userIndexingService = Objects.requireNonNull(userIndexingService, "userIndexingService must not be null!");
    }

    @PostMapping("/user")
    private ResponseEntity<UserModel> startNewUserIndexingProcess(@RequestBody final UserModel userModel) {
        return userIndexingService.saveNewUser(userModel)
                .map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.BAD_REQUEST));
    }

    @PostMapping("/post")
    private ResponseEntity<PostModel> startNewPostIndexingProcess(@RequestBody final PostModel postModel) {
        return userIndexingService.saveNewPost(postModel)
                .map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.BAD_REQUEST));
    }

    @PostMapping(value = "/file", consumes = "multipart/form-data")
    private ResponseEntity<FileModel> startNewFileIndexingProcess(@RequestParam("fileModel") final String fileModel, @RequestParam("file") final MultipartFile file){
        return userIndexingService.saveNewFile(fileModel, file)
                .map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.BAD_REQUEST));
    }
}
