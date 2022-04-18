#删除所有创建的 service 以及其下的容器实例，不过后者要等几秒才能生效
sudo docker service rm pos-gateway
sudo docker service rm pos-frontend
sudo docker service rm pos-carts
sudo docker service rm pos-products

#删除创建的重叠网络
sudo docker network rm sawork-2022

echo "waiting for the containers to be deleted..."; sleep 10s

#删除所有下载的微服务镜像
sudo docker rmi registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-discovery:test
sudo docker rmi registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-products:test
sudo docker rmi registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-carts:test
sudo docker rmi registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-frontend:test
sudo docker rmi registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-gateway:test

#关闭 nginx 服务
sudo nginx -s stop
