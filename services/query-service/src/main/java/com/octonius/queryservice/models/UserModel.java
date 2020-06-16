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
public class UserModel {
    private String id;
    private String fullName;
    private String email;
    private Boolean active;
    private List<String> userSkills;
    private String workspace;

    @Override
    public String toString() {
        return "UserModel{" +
                "id='" + id + '\'' +
                ", fullName='" + fullName + '\'' +
                ", email='" + email + '\'' +
                ", active=" + active +
                ", userSkills=" + userSkills.toString() + ", workspace=" + workspace +
                '}';
    }
}
