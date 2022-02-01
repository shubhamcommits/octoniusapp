FROM libreoffice/online:master

# Make LOOL script executable.
#RUN chmod +x /run-lool.sh

# Create volumes.
VOLUME ["/etc/loolwsd"]

# Set workdir.
WORKDIR /

COPY ./loolwsd.xml /etc/loolwsd/loolwsd.xml

# TCP port that container will listen for connections.
# HTTP and HTTPS.
EXPOSE 9980/tcp

#CMD ["sh", "-c", "/run-lool.sh"]
