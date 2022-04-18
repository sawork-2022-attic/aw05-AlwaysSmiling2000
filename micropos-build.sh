#安装本地依赖
cd pos-api; mvn install; cd ..

#打包所有微服务
mvn clean package

#发布 react 应用
cd pos-frontend; npm run build; cd ..

#创建每个微服务的容器镜像
cd pos-carts; sudo docker build -t pos-carts:test .; cd ..
cd pos-frontend; sudo docker build -t pos-frontend:test .; cd ..
cd pos-gateway; sudo docker build -t pos-gateway:test .; cd ..
cd pos-products; sudo docker build -t pos-products:test .; cd ..
