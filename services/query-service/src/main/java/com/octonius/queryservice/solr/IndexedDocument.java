package com.octonius.queryservice.solr;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.solr.common.SolrInputDocument;

@Slf4j
public class IndexedDocument<T> {
    private final SolrInputDocument document = new SolrInputDocument();

    private final String id;

    private final T documentValue;

    public IndexedDocument(final String id, T documentValue) {
        this.id = id;
        this.documentValue = documentValue;
    }

    public SolrInputDocument solrInputDocument(final ObjectMapper objectMapper) {
        document.addField("id", id);
        document.addField("clazz", documentValue.getClass().getName());

        addJsonDocumentValue(objectMapper);

        return document;
    }

    public IndexedDocument<T> addString(final String name, final String value) {
        if (value == null) {
            return this;
        }

        document.addField(name + "_t", value);
        return this;
    }

    public IndexedDocument<T> addStrings(final String name, final Object[] values) {
        if (values == null) {
            return this;
        }

        document.addField(name + "_ss", values);
        return this;
    }

    public IndexedDocument<T> addBoolean(final String name, final Boolean value) {
        if (value == null) {
            return this;
        }

        document.addField(name + "_b", value);
        return this;
    }

    private void addJsonDocumentValue(final ObjectMapper objectMapper) {
        try {
            document.addField("json_document", objectMapper.writeValueAsString(documentValue));
        } catch (final JsonProcessingException ex) {
            log.error("Failed to map document value as string!", ex);
        }
    }

    @Override
    public String toString() {
        return "IndexedDocument [id=" + id + ", document=" + document + ", documentValue=" + documentValue + "]";
    }
}
