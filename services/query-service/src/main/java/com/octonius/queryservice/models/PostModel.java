package com.octonius.queryservice.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostModel {
    private String id;
    private String title;
    private String content;
    private String type;
    private List<String> attachedTags;
    private String workspace;

    @Override
    public String toString() {
        return "PostModel{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", content='" + content + '\'' +
                ", type='" + type + '\'' +
                ", attachedTags=" + attachedTags.toString() + ", workspace=" + workspace + 
                '}';
    }
}
