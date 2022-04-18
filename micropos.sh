#从我的阿里云仓库（免费版）拉取各个微服务的容器镜像
sudo docker pull registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-carts:test
sudo docker pull registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-frontend:test
sudo docker pull registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-gateway:test
sudo docker pull registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-products:test

#开启 nginx 代理，把请求代理到容器内的 gateway 上
sudo nginx -c $(pwd)/nginx.conf

#创建重叠网络，所有的微服务容器在此重叠网络上可以互相访问
sudo docker network create -d overlay sawork-2022

#使用 docker swarm 部署微服务集群
#--name 指定服务名称，容器实例可以把服务名称作为主机名来互相访问（要加端口，由 -p 指定）
#--network 指定使用的网络驱动，如果不指定会用默认的 ingress 网络，但不知道为什么在这个网络上容器不能互相访问
#--replicas 指定要创建几个容器，实际上就是几个服务实例；如果集群中有 n 台主机，--replicas=m 会创建这个服务的 m 个容器实例，并且把这 m 个实例分配到 n 台主机上（m 不一定要等于 n）
sudo docker service create -p 8001:8001 --name pos-products --network sawork-2022 --replicas=1 registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-products:test
sudo docker service create -p 9001:9001 --name pos-carts --network sawork-2022 --replicas=1 registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-carts:test
sudo docker service create -p 3000:3000 --name pos-frontend --network sawork-2022 --replicas=1 registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-frontend:test
sudo docker service create -p 6001:6001 --name pos-gateway --network sawork-2022 --replicas=1 registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-gateway:test

#如何加入新的主机到 docker 集群 -- https://docs.docker.com/engine/swarm/join-nodes/
#我提供的脚本只用了一台主机
