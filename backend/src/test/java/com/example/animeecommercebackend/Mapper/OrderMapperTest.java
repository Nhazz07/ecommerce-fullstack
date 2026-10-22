package com.example.animeecommercebackend.Mapper;

import com.example.animeecommercebackend.Dto.Response.OrderItemResponseDto;
import com.example.animeecommercebackend.Dto.Response.OrderResponseDto;
import com.example.animeecommercebackend.Entity.Order;
import com.example.animeecommercebackend.Entity.OrderItem;
import com.example.animeecommercebackend.Entity.Product;
import com.example.animeecommercebackend.Entity.ProductImages;
import com.example.animeecommercebackend.Entity.ProductVariant;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class OrderMapperTest {

    @Test
    void mapsPersistedOrderItemValuesAndRelatedDisplayData() {
        Product product = new Product();
        product.setProductName("Figure");

        ProductImages image = new ProductImages();
        image.setImageUrl("https://images.example/figure.png");
        product.setProductImages(List.of(image));

        ProductVariant variant = new ProductVariant();
        variant.setId(56L);
        variant.setName("Limited Edition");
        variant.setSku("FIG-LTD");
        variant.setPrice(new BigDecimal("99.00"));
        variant.setProduct(product);

        Order order = new Order();
        order.setId(12L);
        order.setOrderNumber(12345678);

        OrderItem item = new OrderItem();
        item.setId(34L);
        item.setOrder(order);
        item.setProductVariant(variant);
        item.setQuantity(2);
        item.setUnitPrice(new BigDecimal("79.50"));
        item.setSubTotal(new BigDecimal("159.00"));
        order.setOrderItems(List.of(item));

        OrderResponseDto response = OrderMapper.toResponse(order);

        assertEquals(List.of(34L), response.getOrderItems().stream().map(OrderItemResponseDto::getId).toList());
        OrderItemResponseDto responseItem = response.getOrderItems().get(0);
        assertEquals("Figure", responseItem.getProductName());
        assertEquals("Limited Edition", responseItem.getVariantName());
        assertEquals("FIG-LTD", responseItem.getVariantSku());
        assertEquals(2, responseItem.getQuantity());
        assertEquals(new BigDecimal("79.50"), responseItem.getUnitPrice());
        assertEquals(new BigDecimal("159.00"), responseItem.getSubTotal());
        assertEquals("https://images.example/figure.png", responseItem.getProductImageUrl());
        assertEquals(List.of(56L), response.getProductVariantIds());
    }

    @Test
    void mapsMissingOptionalProductImageAsNull() {
        Product product = new Product();
        product.setProductName("No image product");
        product.setProductImages(List.of());

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);

        OrderItem item = new OrderItem();
        item.setProductVariant(variant);

        Order order = new Order();
        order.setOrderItems(List.of(item));

        assertNull(OrderMapper.toResponse(order).getOrderItems().get(0).getProductImageUrl());
    }
}
