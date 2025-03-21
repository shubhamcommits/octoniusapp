##### Build the docker image

To build the docker image use `docker build local_office`. Please keep in mind that this can take several hours depending on your system.

The image default build arguments are based on the remote upstream, for a more convinient security patch.

To modifiy them use `docker build --build-arg COLLABORA_ONLINE_BRANCH=<> ...`

```
### Environment Variables
ENV COLLABORA_ONLINE_BRANCH=${COLLABORA_ONLINE_BRANCH:-"master"} \
    COLLABORA_ONLINE_VERSION=${COLLABORA_ONLINE_VERSION:-"cp-21.11.5-2"} \
    COLLABORA_ONLINE_REPO_URL=${COLLABORA_ONLINE_REPO_URL:-"https://github.com/CollaboraOnline/online"} \
    #
    LIBREOFFICE_BRANCH=${LIBREOFFICE_BRANCH:-"master"} \
    LIBREOFFICE_VERSION=${LIBREOFFICE_VERSION:-"cp-21.06.31-1"} \
    LIBREOFFICE_REPO_URL=${LIBREOFFICE_REPO_URL:-"https://github.com/LibreOffice/core"} \
    #
    APP_NAME=${APP_NAME:-"Document Editor"} \
    #
    POCO_VERSION=${POCO_VERSION:-"poco-1.11.1-release.tar.gz"} \
    POCO_URL=${POCO_URL:-"https://github.com/pocoproject/poco/archive/"} \
    #
    MAX_CONNECTIONS=${MAX_CONNECTIONS:-"100000"} \
    ## Uses Approximately 20mb per document open
    MAX_DOCUMENTS=${MAX_DOCUMENTS:-"100000"}
```
