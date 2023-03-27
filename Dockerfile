FROM centos

WORKDIR /app

RUN cd /etc/yum.repos.d/
RUN sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-*
RUN sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-*
RUN yum makecache
RUN yum update -y
RUN yum install -y vim wget zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel gcc* make nodejs
RUN wget https://github.com/Dreamacro/clash/releases/download/v1.14.0/clash-linux-amd64-v1.14.0.gz
RUN wget https://github.com/Dreamacro/maxmind-geoip/releases/download/20230312/Country.mmdb
RUN npm install -g n --registry https://registry.npmmirror.com
RUN n latest
RUN npm i -g pm2 --registry https://registry.npmmirror.com

RUN gzip -d ./clash-linux-amd64-v1.14.0.gz
RUN mv clash-linux-amd64-v1.14.0 clash
RUN chmod u+x clash
RUN pm2 start ./clash

COPY . /app
RUN npm install --registry https://registry.npmmirror.com

RUN rm -f /root/.config/clash/config.yaml
RUN rm -f /root/.config/clash/Country.mmdb
RUN mv clash.service /etc/systemd/system/
RUN mv config.yaml /root/.config/clash/
RUN mv Country.mmdb /root/.config/clash/

RUN echo export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890

EXPOSE $PORT

CMD sh -c "pm2 start ./clash && npm start"