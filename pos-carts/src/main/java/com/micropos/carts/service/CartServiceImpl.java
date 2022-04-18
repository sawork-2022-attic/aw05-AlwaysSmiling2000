package com.micropos.carts.service;

import com.micropos.api.dto.ProductDto;
import com.micropos.carts.model.Item;
import com.micropos.carts.repository.CartRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class CartServiceImpl implements CartService {

    private static final String POS_PRODUCTS_URL = "http://pos-gateway:6001/api";

    private final CartRepository cartRepository;

    private final RestTemplate restTemplate;

    public CartServiceImpl(CartRepository cartRepository, RestTemplate restTemplate) {
        this.cartRepository = cartRepository;
        this.restTemplate = restTemplate;
    }

    @Override
    @Cacheable(value = "items", unless = "#result != null && #result.size() > 0")
    public List<Item> items() {
        List<Item> itemList = cartRepository.allItems();
        // 按加入购物车的时间进行排序
        itemList.sort((item1, item2) -> {
            long tsDiff = item1.getTimeStamp() - item2.getTimeStamp();
            return tsDiff < 0 ? -1 : tsDiff > 0 ? 1 : 0;
        });
        return itemList;
    }

    @Override
    @Cacheable(value = "getItem", unless = "#result != null")
    public Item getItem(String productId) {
        return cartRepository.findItem(productId);
    }

    // 保持缓存一致性
    @Override
    @CacheEvict(value = {"items", "getItem"}, allEntries = true)
    public boolean removeAll() {
        return cartRepository.deleteAll();
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "items", allEntries = true),
            @CacheEvict(value = "getItem", allEntries = false, key = "#root.args[0]")
    })
    public boolean removeItem(String productId) {
        return cartRepository.deleteItem(productId);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "items", allEntries = true),
            @CacheEvict(value = "getItem", allEntries = false, key = "#root.args[0]")
    })
    public boolean updateItem(String productId, int quantity) {
        Item item = cartRepository.findItem(productId);
        if (item == null) {
            if (quantity <= 0) {
                // 新加入的数量必须为正
                return false;
            }
            // 加入一件新商品，先从 pos-products 取数据
            ProductDto productDto = restTemplate.getForObject(POS_PRODUCTS_URL + "/products/" + productId, ProductDto.class);
            if (productDto == null) {
                // 没有此商品
                return false;
            }
            // 加入购物车
            return cartRepository.insertItem(productDto, quantity);
        }
        // 购物车中已有此商品，检查剩余数量
        int newQuantity = item.getQuantity() + quantity;
        if (newQuantity < 0) {
            return false;
        } else if (newQuantity == 0) {
            // 删除该物品
            return cartRepository.deleteItem(productId);
        }
        // 更新数量
        return cartRepository.updateItem(productId, newQuantity);
    }

}
