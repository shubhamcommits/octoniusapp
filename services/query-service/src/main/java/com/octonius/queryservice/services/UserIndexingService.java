package com.octonius.queryservice.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.octonius.queryservice.models.*;
import com.octonius.queryservice.repositories.SolrRepository;
import com.octonius.queryservice.solr.IndexedDocument;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.Parser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class UserIndexingService {
    private final SolrRepository solrRepository;

    private Parser parser;

    public UserIndexingService(final SolrRepository solrRepository) {
        this.solrRepository = Objects.requireNonNull(solrRepository, "solrRepository must not be null!");
    }

    public Optional<UserModel> saveNewUser(final UserModel userModel) {
        IndexedDocument<UserModel> doc = new IndexedDocument<>(userModel.getId(), userModel);
        doc.addString("fullName", userModel.getFullName());
        doc.addString("email", userModel.getEmail());
        doc.addBoolean("active", userModel.getActive());
        doc.addStrings("userSkills", userModel.getUserSkills().toArray());

        solrRepository.save(doc);
        return Optional.of(userModel);
    }

    public Optional<PostModel> saveNewPost(final PostModel postModel) {
        IndexedDocument<PostModel> doc = new IndexedDocument<>(postModel.getId(), postModel);
        doc.addString("title", postModel.getTitle());
        doc.addString("content", postModel.getContent());
        doc.addStrings("attachedTags", postModel.getAttachedTags().toArray());
        doc.addString("type", postModel.getType());

        solrRepository.save(doc);
        return Optional.of(postModel);
    }

    public Optional<FileModel> saveNewFile(String file, MultipartFile multipartFile) {
        FileModel fileModel = null;
        try{
            ObjectMapper objectMapper = new ObjectMapper();
            fileModel = objectMapper.readValue(file, FileModel.class);
            parser = new AutoDetectParser();
            extractFile(parser, fileModel, multipartFile);
        }
        catch (Exception e){
            log.error(String.valueOf(e));
        }
        IndexedDocument<FileModel> doc = new IndexedDocument<>(fileModel.getId(), fileModel);
        doc.addString("postedBy", fileModel.getPostedBy());
        doc.addString("originalFileName", fileModel.getOriginalFileName());
        doc.addString("modifiedFileName", fileModel.getModifiedFileName());
        doc.addString("group", fileModel.getGroup());
        doc.addString("content", fileModel.getContent().toLowerCase());
        solrRepository.save(doc);
        return Optional.of(fileModel);
    }

    private void extractFile(final Parser parser, FileModel fileModel, MultipartFile file) throws IOException, TikaException, SAXException {
        BodyContentHandler handler = new BodyContentHandler();
        Metadata metadata = new Metadata();

        InputStream content = file.getInputStream();
        parser.parse(content, handler, metadata, new ParseContext());
        fileModel.setContent(handler.toString().toLowerCase());
    }
}
