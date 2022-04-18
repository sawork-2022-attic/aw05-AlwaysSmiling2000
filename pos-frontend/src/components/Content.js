import React, {useEffect, useState} from "react";
import {Button, Card, List, Spin} from "antd";

import "./Content.css";

export default function Content(props) {
  // 商品列表数据
  const [products, setProducts] = useState([]);

  // 是否加载完毕
  const [isLoading, setIsLoading] = useState(true);

  // 页面第一次载入时从后端取数据
  useEffect(() => {
    // React 推荐在 hooks 内部定义异步函数调用
    const loadProducts = async () => {
      await fetch(
        "http://localhost:8080/api/products",
        {
          method: "GET"
        }
      ).then(reponse => {
        if (reponse.ok) {
          return reponse.json();
        } else {
          throw Error("Failed to load products!");
        }
      }).then(data => {
        setProducts(data.filter(product => product.id !== ""));
      }).catch(error => {
        console.log(error.message);
      });
    }
    // 取数据
    loadProducts().then(r => setIsLoading(false));
  }, []);

  const {requestAddItem} = props;

  return (
    <div className="content">
      {
        isLoading ?
          <div className="spin-container">
            <Spin
              size="large"
            />
          </div> :
          <div className="list-container">
            <List
              grid={{column: 5}}
              split={false}
              dataSource={products}
              renderItem={product => (
                <List.Item>
                  <Card
                    bordered={false}
                    cover={
                      <img
                        alt={product.image}
                        src={product.image}
                        style={{width: "125px", height: "auto"}}
                      />
                    }
                    actions={[
                      <Button
                        key="add"
                        onClick={() => requestAddItem(product.id, 1)}
                        shape="round"
                        type="primary"
                        danger
                      >
                        加入购物车
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <span
                          style={{
                            float: "right"
                          }}
                        >
                          {"￥" + product.price.toFixed(1)}
                        </span>
                      }
                      description={product.name}
                    />
                  </Card>
                </List.Item>
              )}
            />
          </div>
      }
    </div>
  );
}
