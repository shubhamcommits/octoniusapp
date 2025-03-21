FROM ruby

RUN apt-get update -y && \
    apt-get install -y bash-completion command-not-found mtr-tiny dnsutils net-tools ldns && \
    apt-get install -y nmap traceroute netcat iproute2 tcpdump iputils-ping isc-dhcp-client && \
    apt-get install -y openssh-server openssh-client tmux screen vim nano && \
    apt-get clean -qy

# More readable bash prompt, with timestamp and colours
# Plus set up SSH, with default root pass of 'net'
SHELL ["/bin/bash","-c"]
RUN echo 'PS1="\[\033[35m\]\t \[\033[32m\]\h\[\033[m\]:\[\033[33;1m\]\w\[\033[m\] # "' >> /root/.bashrc && \
    chsh -s /bin/bash root && \
    mkdir /run/sshd && \
    echo "PermitRootLogin yes" >> /etc/ssh/sshd_config && \
    echo 'root:net' | chpasswd

WORKDIR /migrate

COPY Gemfile Gemfile
COPY migrate migrate.rb
RUN bundle install
RUN `wget https://dl.min.io/client/mc/release/linux-amd64/mc && chmod +x mc`
