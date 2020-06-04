package com.octonius.queryservice.solr;

import java.util.List;
import java.util.Objects;

public class QueryResponse<T> {
    private List<QueryCondition> conditions;
    private List<QuerySort> sortList;
    private List<T> content;

    public List<QueryCondition> getConditions() {
        return conditions;
    }

    public QueryResponse<T> setConditions(final List<QueryCondition> conditions) {
        this.conditions = conditions;
        return this;
    }

    public List<QuerySort> getSortList() {
        return sortList;
    }

    public QueryResponse<T> setSortList(final List<QuerySort> sortList) {
        this.sortList = sortList;
        return this;
    }

    public List<T> getContent() {
        return content;
    }

    public QueryResponse<T> setContent(final List<T> content) {
        this.content = content;
        return this;
    }

    @Override
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (!(o instanceof QueryResponse)) return false;
        final QueryResponse<?> that = (QueryResponse<?>) o;
        return Objects.equals(getConditions(), that.getConditions()) &&
                Objects.equals(getSortList(), that.getSortList()) &&
                Objects.equals(getContent(), that.getContent());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getConditions(), getSortList(), getContent());
    }

    @Override
    public String toString() {
        return "QueryResponse{" +
                "conditions=" + conditions +
                ", sortList=" + sortList +
                ", content=" + content +
                '}';
    }

    public static int calculateTotalPages(long pageSize, long numFound) {
        if (numFound % pageSize == 0) {
            return Math.toIntExact(numFound / pageSize) - 1;
        }
        return Math.toIntExact(numFound / pageSize);
    }
}

