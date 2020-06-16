package com.octonius.queryservice.models;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileModel {

    private String id;
    private String postedBy;
    private String originalFileName;
    private String modifiedFileName;
    private String group;
    private String mimeType;
    private String content;
    private String workspace;
}
