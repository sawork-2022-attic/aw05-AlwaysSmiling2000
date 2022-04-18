# Containerized MicroPoS 

这个分支提供了 MicroPoS 的容器化版本，其中每个微服务实例作为一个单独的容器部署在 docker 集群中；并且该 docker 集群可以由多台主机组成，每台主机上又可以运行多个不同服务的多个实例。

## 背景支撑

这里的容器集群部署主要依赖于 docker swarm；docker swarm 是 docker 自带的集群管理模式，它通过在主机网络上构建重叠网络来实现容器实例之间的路由。除了 docker swarm 之外我们也可以使用 k8s 来部署容器集群，k8s 可以使用 docker 以外的容器化工具（k8s 好像才是行业标准，不过简单起见我们就用 docker swarm）。

## 运行方法

首先需要启动 docker 服务，并且新建一个 swarm：

```shell
#启动 docker 服务器
sudo service docker start

# 新建一个 swarm，执行此命令的主机会成为这个 swarm 的 manager node
sudo docker swarm init

# 如果执行上面的命令报错，说你已经在一个 swarm 里的话（如果你的主机之前加入过某个 swarm，并且没有主动退出）
# sudo docker swarm leave --force
# 然后重新执行上面的 init

# 从我的阿里云镜像仓库拉取镜像并运行
./micropos.sh

# 访问本机的 localhost:8080 获取前端页面

# 清理所有下载的镜像和创建的容器实例（不必先停止容器）
./micropos-clean.sh
# 通过 docker service rm <service_name> 来删除服务的容器实例是有延迟的，如果中间出现失败，过一会儿再执行就好了
```

我用的阿里云镜像仓库是免费个人版，如果出现 connection refused 的问题，可以运行 ./micropos-build.sh 直接在本地构建镜像；但要注意这个时候虽然可以在本地运行整个微服务，但 docker 集群其实已经不能正常工作了。docker swarm 要求使用的镜像必须是从某个 registry 里下载来的，这样才能保证不同的 docker 主机上运行的是同一个镜像的实例；如果没有 registry 认证，其结果可能是所有的容器实例都部署在同一台主机上，而不是分散在整个 docker 集群中。

## 应用结构

docker swarm 说起来比较复杂，它的 routing mesh 提供了容器发现和容器间负载均衡的功能，因此在这个分支中我去掉了 eureka （实际上 eureka 在 docker 里也用不了，因为它得到的是 docker 分配给每个容器的虚拟地址，容器之间通过虚拟地址是不能互相调用的），总的来讲目前的应用结构和下图相仿：

![https://docs.docker.com/engine/swarm/images/ingress-lb.png](https://docs.docker.com/engine/swarm/images/ingress-lb.png)

这张图来自 docker 官方文档，里面有关于 docker swarm 和 overlay network 的详细描述，以及如何使用 docker service 来管理微服务。其中的 HAProxy 被我换成了 nginx（运行在 localhost:8080），然后如果你只在一台主机上运行所有微服务的话，下面的三个方框就只有一个。方框里面有我们的 gateway、products、carts 和 frontend 实例。

这张图说的是，同一个 swarm 集群的任何一台主机上的任何一个微服务实例，都可以通过 http://<service_name>:<service_publish_port> 的方式来调用其它的微服务实例。这个 http 请求会被 swarm load balancer 自动分发到整个容器集群中出于 active 状态（有 health check）的某个容器实例上。

docker swarm 说起来太多了，推荐阅读官方文档（如果感兴趣的话）；要是镜像 pull 不下来，就当这个特性不存在吧。

总之我们要实现不同主机的 docker 容器之间互通，其实只需要搭建一个中心服务器，通过它在不同的主机上创建容器实例（docker 是 C/S 模式），并记录服务名称到容器地址（IP、端口号）的映射就行了。然后我们可以在这个中心服务器上做负载均衡等等。
