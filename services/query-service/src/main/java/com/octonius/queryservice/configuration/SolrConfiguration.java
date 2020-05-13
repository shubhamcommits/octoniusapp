package com.octonius.queryservice.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.octonius.queryservice.repositories.SolrRepository;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SolrConfiguration {

    @Value("${application.config.solr-client-url}")
    private String solrClientUrl;

    @Value("${application.config.solr-connection-timeout}")
    private int solrConnectionTimeout;

    @Value("${application.config.solr-socket-timeout}")
    private int solrSocketTimeout;

    @Value("${application.config.solr-commit-within}")
    private int solrCommitWithinMs;

    @Value("${application.config.solr-catalog}")
    private String solrCatalog;

    @Bean
    public HttpSolrClient solrClient() {
        return new HttpSolrClient.Builder(solrClientUrl)
                .withConnectionTimeout(solrConnectionTimeout)
                .withSocketTimeout(solrSocketTimeout)
                .build();
    }

    @Bean
    public SolrRepository solrRepository(final ObjectMapper objectMapper) {
        return new SolrRepository(solrCatalog, solrCommitWithinMs, solrClient(), objectMapper);
    }
}
