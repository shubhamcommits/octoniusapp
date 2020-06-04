package com.octonius.queryservice.services;

import com.octonius.queryservice.models.UserModel;
import com.octonius.queryservice.repositories.SolrRepository;
import com.octonius.queryservice.solr.QueryRequest;
import com.octonius.queryservice.solr.QueryResponse;
import com.octonius.queryservice.solr.SolrList;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
@Slf4j
public class UserSearchService {

    private final SolrRepository solrRepository;

    public UserSearchService(final SolrRepository solrRepository) {
        this.solrRepository = Objects.requireNonNull(solrRepository, "solrRepository must not be null!");
    }

    public Optional<UserModel> getUserById(final String userId) {
        SolrList<UserModel> records = solrRepository.getById(userId, UserModel.class);

        if (records.getContent().size() > 0) {
            return Optional.of(records.getContent().get(0));
        } else {
            throw new RuntimeException("Not found: com.octonius.queryservice.UserModel/" + userId);
        }
    }

    public Optional<QueryResponse<UserModel>> filterByQueryRequest(final QueryRequest queryRequest) {
        try {
            SolrList<UserModel> solrList = solrRepository.fromQueryRequest(queryRequest, UserModel.class);
            return Optional.of(new QueryResponse<UserModel>()
                    .setConditions(queryRequest.getConditions())
                    .setSortList(queryRequest.getSortList())
                    .setContent(solrList.getContent()));
        } catch (final NoSuchFieldException ex) {
            log.error("Failed to query the UserModel: NoSuchFieldException", ex);
            return Optional.empty();
        }
    }
}
