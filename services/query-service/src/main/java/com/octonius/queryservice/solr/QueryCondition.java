package com.octonius.queryservice.solr;

import java.util.Objects;

public class QueryCondition {
    private String columnName;
    private ConditionOperator conditionOperator;
    private Object value;

    public String getColumnName() {
        return columnName;
    }

    public QueryCondition setColumnName(final String columnName) {
        this.columnName = columnName;
        return this;
    }

    public ConditionOperator getConditionOperator() {
        return conditionOperator;
    }

    public QueryCondition setConditionOperator(final ConditionOperator conditionOperator) {
        this.conditionOperator = conditionOperator;
        return this;
    }


    @Override
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (!(o instanceof QueryCondition)) return false;
        final QueryCondition that = (QueryCondition) o;
        return Objects.equals(columnName, that.columnName) &&
                conditionOperator == that.conditionOperator &&
                Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(columnName, conditionOperator, value);
    }

    @Override
    public String toString() {
        return "QueryCondition{" +
                "columnName='" + columnName + '\'' +
                ", conditionOperator=" + conditionOperator +
                ", value='" + value + '\'' +
                '}';
    }

    public Object getValue() {
        return value;
    }

    public QueryCondition setValue(Object value) {
        this.value = value;
        return this;
    }

}
