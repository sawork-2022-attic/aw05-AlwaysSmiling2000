import React, {useState} from "react";
import {ArrowUpOutlined} from "@ant-design/icons";
import {Button, message} from "antd";
import Header from "./components/Header";
import Content from "./components/Content";
import Sider from "./components/Sider";
import "antd/dist/antd.min.css";
import "./App.css";

export default function App(props) {
  // 购物车清单（状态提升，用于组件间通信）
  const [itemList, setItemList] = useState([]);

  // 添加商品
  const addItem = (newItem) => {
    let notNew = false;
    for (let idx in itemList) {
      if (itemList[idx].id === newItem.id) {
        notNew = true;
        break;
      }
    }
    // 如果不是新的，就更新原来的值
    if (notNew) {
      setItemList(
        itemList.map(
          item => item.id === newItem.id ?
            {...item, quantity: newItem.quantity} :
            item
        )
      );
    } else {
      setItemList([...itemList, newItem]);
    }
  }

  // 删除某件商品
  const removeItem = (productId) => {
    setItemList(itemList.filter(item => item.id !== productId));
  }

  // 清空购物车
  const emptyItems = () => {
    setItemList([]);
  }

  // 操作随状态
  const requestAddItem = async (productId, quantity) => {
    await fetch(
      `http://localhost:8080/api/carts/${productId}?quantity=${quantity}`,
      {
        method: "POST"
      }
    ).then(response => {
      if (response.ok) {
        return true;
      } else {
        throw Error("Failed to add item!");
      }
    }).then(ok => {
      // 如果成功再从后端取 item 的信息
      // 其实后端也可以直接返回一个 item 对象，分开取的好处是更灵活
      // 前端可以选择自己维护数据
      fetch(
        `http://localhost:8080/api/carts/${productId}`,
        {
          method: "GET"
        }
      ).then(response => {
        if (response.ok) {
          message.success(quantity > 0 ? "添加成功" : "成功移除一件商品");
          return response.json();
        } else {
          throw Error("Failed to fetch added item!");
        }
      }).then(data => {
        addItem(data);
      });
    }).catch(error => {
      message.error(error.message);
    });
  }

  const requestGetItems = async () => {
    return await fetch(
      "http://localhost:8080/api/carts",
      {
        method: "GET"
      }
    ).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error("Failed to get items!");
      }
    }).then(data => {
      setItemList(data);
    }).catch(error => {
      console.log(error.message);
    })
  }

  const requestRemoveItem = async (productId) => {
    await fetch(
      `http://localhost:8080/api/carts/${productId}`,
      {
        method: "DELETE"
      }
    ).then(response => {
      if (response.ok) {
        message.success("删除成功");
        removeItem(productId);
      } else {
        throw Error("Failed to delete item!");
      }
    }).catch(error => {
      message.error(error.message);
    })
  }

  const requestEmptyItems = async () => {
    await fetch(
      `http://localhost:8080/api/carts`,
      {
        method: "DELETE"
      }
    ).then(response => {
      if (response.ok) {
        message.success("购物车已清空");
        emptyItems();
      } else {
        throw Error("Failed to empty items!");
      }
    }).catch(error => {
      message.error(error.message);
    })
  }

  // 展示购物车的侧边栏
  const sider = (
    <Sider
      itemList={itemList}
      requestGetItems={requestGetItems}
      requestAddItem={requestAddItem}
      requestRemoveItem={requestRemoveItem}
      requestEmptyItems={requestEmptyItems}
    />
  );

  return (
    <div className="app">
      {/*展示搜索框等信息，购物车作为 Header 的下拉菜单弹出*/}
      <Header
        sider={sider}
        itemList={itemList}
      />
      {/*展示商品*/}
      <Content
        requestAddItem={requestAddItem}
      />
      {/*返回顶部的按钮*/}
      <Button
        shape="circle"
        onClick={() => window.scrollTo(0, 0)}
        style={{
          position: "fixed",
          right: "2%",
          bottom: "5%",
          width: "50px",
          height: "50px",
          fontSize: "28px"
        }}
      >
        <ArrowUpOutlined/>
      </Button>
    </div>
  );
}
