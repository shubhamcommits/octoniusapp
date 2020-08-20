#
# Build stage
#
FROM maven:3.6.0-jdk-11-slim AS build
COPY src /home/app/src
COPY pom.xml /home/app
RUN mvn -f /home/app/pom.xml clean package

#
# Package stage
#
FROM openjdk:11-jre-slim
COPY --from=build /home/app/target/query-service.jar /usr/local/lib/query-service.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/usr/local/lib/query-service.jar"]

#
# Elasticsearch index data
#
#FROM elasticsearch
#RUN mkdir /data && chown -R elasticsearch:elasticsearch /data && echo 'es.path.data: /data' >> config/elasticsearch.yml && echo 'path.data: /data' >> config/elasticsearch.yml
#ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/e1f115e4ca285c3c24e847c4dd4be955e0ed51c2/wait-for-it.sh /utils/wait-for-it.sh
## Copy the files you may need and your insert script
#RUN /docker-entrypoint.sh elasticsearch -p /tmp/epid & /bin/bash /utils/wait-for-it.sh -t 0 localhost:9200 -- path/to/insert/script.sh; kill $(cat /tmp/epid) && wait $(cat /tmp/epid); exit 0;
