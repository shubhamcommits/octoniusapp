package com.octonius.queryservice.solr;

import java.util.List;
import java.util.Optional;

public enum ConditionOperator {
    EQUAL(SolrFilterQueryRule.EQUALS),
    STARTS_WITH(SolrFilterQueryRule.STARTS_WITH),
    CONTAINS(SolrFilterQueryRule.LIKE),
    CONTAINS_WORDS(SolrFilterQueryRule.IN),

    IN(SolrFilterQueryRule.IN);

    private final SolrFilterQueryRule solrOperator;

    ConditionOperator(SolrFilterQueryRule solrOperator) {
        this.solrOperator = solrOperator;
    }

    public SolrFilterQueryRule getSolrOperator() {
        return solrOperator;
    }

    public String makeSolrFilter(final String field, final Object value) {
        String filter = value.toString().trim();

        if (CONTAINS_WORDS.equals(this)) {
            filter = filter.replaceAll(" +", " ");
            String[] words = filter.split(" ");
            filter = "*" + String.join("* AND *", words) + "*";
        }

        if (IN.equals(this)) {
            Optional<String> query = ((List) value).stream().map(Object::toString).reduce((o, o2) -> o + " OR " + o2);
            return solrOperator.apply(field, query.isPresent() ? query.get() : "");
        }

        return solrOperator.apply(field, filter);
    }

    private boolean isDateField(String field) {
        return field.endsWith("_dt");
    }
}
