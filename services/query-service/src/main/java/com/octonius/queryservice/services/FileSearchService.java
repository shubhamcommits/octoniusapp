package com.octonius.queryservice.services;


import com.octonius.queryservice.models.FileModel;
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
public class FileSearchService {

    private final SolrRepository solrRepository;

    public FileSearchService(final SolrRepository solrRepository) {
        this.solrRepository = Objects.requireNonNull(solrRepository, "solrRepository must not be null!");
    }

    public Optional<FileModel> getFileById(final String fileId) {
        SolrList<FileModel> records = solrRepository.getById(fileId, FileModel.class);

        if (records.getContent().size() > 0) {
            return Optional.of(records.getContent().get(0));
        } else {
            throw new RuntimeException("Not found: com.octonius.queryservice.FileModel/" + fileId);
        }
    }

    public Optional<QueryResponse<FileModel>> filterByQueryRequest(final QueryRequest queryRequest) {
        try {
            SolrList<FileModel> solrList = solrRepository.fromQueryRequest(queryRequest, FileModel.class);
            return Optional.of(new QueryResponse<FileModel>()
                    .setConditions(queryRequest.getConditions())
                    .setSortList(queryRequest.getSortList())
                    .setContent(solrList.getContent()));
        } catch (final NoSuchFieldException ex) {
            log.error("Failed to query the FileModel: NoSuchFieldException", ex);
            return Optional.empty();
        }
    }
}
