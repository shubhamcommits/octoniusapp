package com.octonius.queryservice.solr;

import org.apache.solr.client.solrj.SolrQuery;

import java.util.Objects;

public class QuerySort {
    private String columnName;
    private SolrQuery.ORDER sortDirection;

    public String getColumnName() {
        return columnName;
    }

    public QuerySort setColumnName(final String columnName) {
        this.columnName = columnName;
        return this;
    }

    public SolrQuery.ORDER getSortDirection() {
        return sortDirection;
    }

    public QuerySort setSortDirection(final SolrQuery.ORDER sortDirection) {
        this.sortDirection = sortDirection;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        QuerySort querySort = (QuerySort) o;
        return Objects.equals(columnName, querySort.columnName) &&
                Objects.equals(sortDirection, querySort.sortDirection);
    }

    @Override
    public int hashCode() {
        return Objects.hash(columnName, sortDirection);
    }

    @Override
    public String toString() {
        return "QuerySort{" +
                "columnName='" + columnName + '\'' +
                ", sortDirection=" + sortDirection +
                '}';
    }
}
