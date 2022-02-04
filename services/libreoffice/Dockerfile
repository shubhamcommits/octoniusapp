FROM ubuntu:18.04

RUN apt-get update && \
	apt-get -y -q install python3-lxml \
		libcap-dev \
		python3-polib \
		libpam-dev \
		libpoco-dev \
		procps \
		inotify-tools \
		build-essential \
		devscripts \
		libcap2-bin \
		libkrb5-dev \
		cpio

RUN cp /etc/apt/sources.list /etc/apt/sources.list~ && \
	sed -Ei 's/^# deb-src /deb-src /' /etc/apt/sources.list && \
	apt-get update

RUN apt-get build-dep -y libreoffice

RUN apt-get -y -q install python-polib

VOLUME ["/opt"]
WORKDIR "/opt"

RUN git clone --depth=1 https://git.libreoffice.org/online

WORKDIR "/opt/online/docker"

RUN NO_DOCKER_PUSH="yes" ONLINE_EXTRA_BUILD_OPTIONS="--enable-anonymization --disable-werror" ./l10n-docker-nightly.sh

EXPOSE 9980/tcp

#ENV DEBIAN_FRONTEND noninteractive

#RUN apt-get update && \
#	apt-get -y -q install \
#		libreoffice \
#		libreoffice-writer \
#		ure \
#		libreoffice-java-common \
#		libreoffice-core \
#		libreoffice-common \
#		openjdk-8-jre \
#		fonts-opensymbol \
#		hyphen-fr \
#		hyphen-de \
#		hyphen-en-us \
#		hyphen-it \
#		hyphen-ru \
#		fonts-dejavu \
#		fonts-dejavu-core \
#		fonts-dejavu-extra \
#		fonts-droid-fallback \
#		fonts-dustin \
#		fonts-f500 \
#		fonts-fanwood \
#		fonts-freefont-ttf \
#		fonts-liberation \
#		fonts-lmodern \
#		fonts-lyx \
#		fonts-sil-gentium \
#		fonts-texgyre \
#		fonts-tlwg-purisa && \
#	apt-get -y -q remove libreoffice-gnome && \
#	apt -y autoremove && \
#	rm -rf /var/lib/apt/lists/*

#RUN adduser --home=/opt/libreoffice --disabled-password --gecos "" --shell=/bin/bash libreoffice

#ADD entrypoint.sh /opt/libreoffice/entrypoint.sh
#RUN chmod +x /opt/libreoffice/entrypoint.sh

#VOLUME ["/tmp"]
#WORKDIR "/tmp"

#ENTRYPOINT ["/opt/libreoffice/entrypoint.sh"]