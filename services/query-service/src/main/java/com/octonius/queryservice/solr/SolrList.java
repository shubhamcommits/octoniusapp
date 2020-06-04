package com.octonius.queryservice.solr;

import org.apache.solr.client.solrj.response.QueryResponse;

import java.util.ArrayList;
import java.util.List;

public class SolrList<T> {
    private long numFound = 0;
    private List<T> content = new ArrayList<>();
    private QueryResponse queryResponse;

    public long getNumFound() {
        return numFound;
    }

    public SolrList<T> setNumFound(final long numFound) {
        this.numFound = numFound;
        return this;
    }

    public List<T> getContent() {
        return content;
    }

    public SolrList<T> setContent(final List<T> content) {
        this.content = content;
        return this;
    }

    public QueryResponse getQueryResponse() {
        return queryResponse;
    }

    public SolrList<T> setQueryResponse(final QueryResponse queryResponse) {
        this.queryResponse = queryResponse;
        return this;
    }

    @Override
    public String toString() {
        return "SolrList{" +
                "numFound=" + numFound +
                ", content=" + content +
                ", queryResponse=" + queryResponse +
                '}';
    }
}
