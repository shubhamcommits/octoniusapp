package com.octonius.queryservice.solr;

import java.util.ArrayList;

@FunctionalInterface
public interface SolrFilterQueryRule {
    SolrFilterQueryRule EQUALS = (Object o, Object o2) -> o + ":\"" + o2 + "\"";
    SolrFilterQueryRule STARTS_WITH = (Object o, Object o2) -> o + ":" + o2 + "*";
    SolrFilterQueryRule LIKE = (Object o, Object o2) -> o + ":*" + o2 + "*";
    SolrFilterQueryRule IN = (Object o, Object o2) -> o + ":(" + o2 + ")";

    String apply(Object left, Object right);
}
