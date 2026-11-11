package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Entity.Inventory;
import com.example.animeecommercebackend.Entity.Order;
import com.example.animeecommercebackend.Entity.OrderItem;
import com.example.animeecommercebackend.Entity.ProductVariant;
import com.example.animeecommercebackend.Repository.InventoryRepository;
import com.example.animeecommercebackend.Repository.ProductVariantRepository;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class InventoryServiceImplTest {
    @Test
    void reservesAndCommitsStockExactlyOnce() {
        InventoryRepository inventories = mock(InventoryRepository.class);
        ProductVariantRepository variants = mock(ProductVariantRepository.class);
        Inventory inventory = new Inventory();
        inventory.setQuantity(9);
        inventory.setReservedQuantity(0);
        inventory.setAvailableQuantity(9);
        ProductVariant variant = new ProductVariant();
        variant.setId(10L);
        OrderItem item = new OrderItem();
        item.setProductVariant(variant);
        item.setQuantity(2);
        Order order = new Order();
        order.setOrderItems(java.util.List.of(item));
        when(inventories.findByProductVariantIdForUpdate(10L)).thenReturn(inventory);

        InventoryServiceImpl service = new InventoryServiceImpl(inventories, variants);
        service.reserveOrderStock(order);
        assertEquals(2, inventory.getReservedQuantity());
        assertEquals(7, inventory.getAvailableQuantity());

        service.commitOrderStock(order);
        service.commitOrderStock(order);
        assertEquals(7, inventory.getQuantity());
        assertEquals(0, inventory.getReservedQuantity());
        assertEquals(7, inventory.getAvailableQuantity());
    }
}
