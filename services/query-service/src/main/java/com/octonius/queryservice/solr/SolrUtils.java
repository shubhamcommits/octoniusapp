package com.octonius.queryservice.solr;

public class SolrUtils {

    private SolrUtils() {
    }

    public static String toFilterQuery(final QueryCondition condition,
                                       final Class targetClass) throws NoSuchFieldException {
        return condition.getConditionOperator()
                .makeSolrFilter(toSolrField(condition.getColumnName(), targetClass), condition.getValue());
    }

    public static String toSolrField(final String field, final Class targetClass) throws NoSuchFieldException {
        String fieldType = targetClass.getDeclaredField(field).getType().getSimpleName();
        switch (fieldType) {
            case "String":
                return field + "_t";
            case "List":
                return field + "_ss";
            case "Long":
                return field + "_l";
            case "Boolean":
                return field + "_b";
            default:
                return field + "_t";
        }
    }
}
