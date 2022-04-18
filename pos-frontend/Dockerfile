FROM nginx

#前端的静态资源文件
COPY build/ /pos-frontend/build/

#nginx 的路径配置
COPY nginx.conf /etc/nginx/conf.d/

#以非守护进程方式启动（否则容器会自动退出）
CMD nginx -g "daemon off;"
