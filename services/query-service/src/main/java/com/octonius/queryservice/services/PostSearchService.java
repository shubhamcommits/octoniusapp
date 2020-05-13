package com.octonius.queryservice.services;

import com.octonius.queryservice.models.PostModel;
import com.octonius.queryservice.repositories.SolrRepository;
import com.octonius.queryservice.solr.QueryRequest;
import com.octonius.queryservice.solr.QueryResponse;
import com.octonius.queryservice.solr.SolrList;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
public class PostSearchService {
    private final SolrRepository solrRepository;

    public PostSearchService(final SolrRepository solrRepository) {
        this.solrRepository = Objects.requireNonNull(solrRepository, "solrRepository must not be null!");
    }

    public Optional<PostModel> getPostById(final String postId) {
        SolrList<PostModel> records = solrRepository.getById(postId, PostModel.class);

        if (records.getContent().size() > 0) {
            return Optional.of(records.getContent().get(0));
        } else {
            throw new RuntimeException("Not found: com.octonius.queryservice.PostModel/" + postId);
        }
    }

    public Optional<QueryResponse<PostModel>> filterByQueryRequest(final QueryRequest queryRequest) {
        try {
            SolrList<PostModel> solrList = solrRepository.fromQueryRequest(queryRequest, PostModel.class);
            return Optional.of(new QueryResponse<PostModel>()
                    .setConditions(queryRequest.getConditions())
                    .setSortList(queryRequest.getSortList())
                    .setContent(solrList.getContent()));
        } catch (final NoSuchFieldException ex) {
            log.error("Failed to query the PostModel: NoSuchFieldException", ex);
            return Optional.empty();
        }
    }
}
