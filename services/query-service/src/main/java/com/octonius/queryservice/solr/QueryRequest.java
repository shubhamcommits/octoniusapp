package com.octonius.queryservice.solr;

import java.util.ArrayList;
import java.util.List;

public class QueryRequest {
    private List<QueryCondition> conditions = new ArrayList<>();
    private List<QuerySort> sortList = new ArrayList<>();

    public List<QueryCondition> getConditions() {
        return conditions;
    }

    public QueryRequest setConditions(final List<QueryCondition> conditions) {
        this.conditions = conditions;
        return this;
    }

    public List<QuerySort> getSortList() {
        return sortList;
    }

    public QueryRequest setSortList(final List<QuerySort> sortList) {
        this.sortList = sortList;
        return this;
    }

    @Override
    public String toString() {
        return "QueryRequest{" +
                "conditions=" + conditions +
                ", sortList=" + sortList +
                '}';
    }
}
