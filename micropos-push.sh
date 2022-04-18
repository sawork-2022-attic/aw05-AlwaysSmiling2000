#登录阿里云的 docker registry
sudo docker login --username=yiyangsunn --password=sawork-2022 registry.cn-hangzhou.aliyuncs.com

#上传微服务镜像
sudo docker tag pos-carts:test registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-carts:test
sudo docker tag pos-discovery:test registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-discovery:test
sudo docker tag pos-frontend:test registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-frontend:test
sudo docker tag pos-gateway:test registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-gateway:test
sudo docker tag pos-products:test registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-products:test

sudo docker push registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-carts:test
sudo docker push registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-discovery:test
sudo docker push registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-frontend:test
sudo docker push registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-gateway:test
sudo docker push registry.cn-hangzhou.aliyuncs.com/sawork-2022/pos-products:test
