package com.octonius.queryservice.repositories;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.octonius.queryservice.solr.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocumentList;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
public class SolrRepository {

    private final String solrCatalog;
    private final int solrCommitWithinMs;
    private final SolrClient solrClient;
    private final ObjectMapper objectMapper;

    public SolrRepository(String solrCatalog, int solrCommitWithinMs, SolrClient solrClient, ObjectMapper objectMapper) {
        this.solrCatalog = solrCatalog;
        this.solrCommitWithinMs = solrCommitWithinMs;
        this.solrClient = solrClient;
        this.objectMapper = objectMapper;
    }

    public <T> void save(IndexedDocument<T> indexedDocument) {
        log.info("save: " + indexedDocument);
        try {
            solrClient.add(solrCatalog, indexedDocument.solrInputDocument(objectMapper), solrCommitWithinMs);
        } catch (final IOException ex) {
            log.error("Failed to add document. Failed to communicate with SOLR server", ex);
        } catch (final SolrServerException ex) {
            log.error("Failed to add document. SOLR internal server error", ex);
        }
    }

    public <T> SolrList<T> getById(final String id, final Class<T> clazz) {
        SolrQuery solrQuery = new SolrQuery("clazz:\"" + clazz.getName() + "\"")
                .addFilterQuery("id:" + id);

        return query(solrQuery, clazz);
    }

    public <T> SolrList<T> query(final SolrQuery solrQuery, final Class<T> clazz) {
        try {
            final QueryResponse response = solrClient.query(solrCatalog, solrQuery);
            final SolrDocumentList documentList = response.getResults();

            List<T> list = documentList.stream()
                    .map(document -> {
                        final List<String> documentValue = Collections.singletonList(String.valueOf(document.getFieldValue("json_document")));
                        return toMapConvertor(documentValue, clazz);
                    })
                    .collect(Collectors.toList());

            return new SolrList<T>()
                    .setContent(list)
                    .setNumFound(documentList.getNumFound())
                    .setQueryResponse(response);
        } catch (final SolrServerException | IOException e) {
            log.error("Failed to query the solr catalog! Query used: {}", solrQuery.toQueryString());
            return new SolrList<>();
        }
    }

    public <T> SolrList<T> fromQueryRequest(final QueryRequest queryRequest, Class<T> clazz) throws NoSuchFieldException {

        SolrQuery query = new SolrQuery("clazz:\"" + clazz.getName() + "\"");

        for (QueryCondition condition : queryRequest.getConditions()) {
            query.addFilterQuery(SolrUtils.toFilterQuery(condition, clazz));
        }

        for (QuerySort sort : queryRequest.getSortList()) {
            query.addSort(SolrUtils.toSolrField(sort.getColumnName(), clazz), sort.getSortDirection());
        }

        return query(query, clazz);
    }

    private <T> T toMapConvertor(final List<String>  documentValue, final Class<T> clazz) {
        if (documentValue.size() == 0) {
            try {
                return (T) clazz.getDeclaredConstructor().newInstance();
            } catch (InstantiationException | IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
                e.printStackTrace();
            }
        }
        try {
            return objectMapper.readValue(documentValue.get(0), clazz);
        } catch (final IOException e) {
            log.error("Object mapper failed to convert documentValue to " + clazz);
            throw new RuntimeException(e);
        }
    }


}
