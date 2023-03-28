# 这是一个基于 centos 基础镜像, 集成了 clash 的 node 代理服务器

## 前提条件

> 请确保安装了 docker 以及购买了 clash 代理

## 使用方法

  1. 克隆本项目

      ```shell
      git clone https://github.com/is-not-lie/centos-clash.git
      ```

  2. 将你的 clash 配置文件复制一份到项目的根目录

  3. 修改 .env 文件中的环境变量, 里面的 PORT 是 node 启动的端口, 而 PROXY_PORT 则是 clash 代理的端口

  4. 打包 docker 镜像

      ```shell
      # 这里的 image_name 是镜像名称, 自行更改
      docker build -t image_name .
      ```

  5. 启动镜像

      ```shell
      # -d 为后台运行
      # -p 为端口号映射, 这里需要注意一点, 因为 Dockerfile 中暴露的端口是通过环境变量传入的, 所以这里的容器端口需要跟 -e 的端口一致
      # -e 设置环境变量
      # --name 容器名称
      # image_name 为镜像名称
      docker run -d -p 11111:11111 -e PORT=11111 --name container_name image_name
      ```

## Q&A

  > 如果构建镜像时报错 "ERROR [23/25] RUN mv config.yaml /root/.config/clash/" 那么把代码注释掉, 等容器跑起来后进入容器, 手动将文件移动到 "/root/.config/clash/" 目录下后重启容器就可以了
