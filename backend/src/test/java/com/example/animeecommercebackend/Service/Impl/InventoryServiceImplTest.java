package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Entity.Inventory;
import com.example.animeecommercebackend.Entity.Order;
import com.example.animeecommercebackend.Entity.OrderItem;
import com.example.animeecommercebackend.Entity.ProductVariant;
import com.example.animeecommercebackend.Dto.Request.InventoryRequestDto;
import com.example.animeecommercebackend.Exception.BusinessConflictException;
import com.example.animeecommercebackend.Repository.InventoryRepository;
import com.example.animeecommercebackend.Repository.ProductVariantRepository;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class InventoryServiceImplTest {
    @Test
    void createsInventoryAndCalculatesAvailableQuantityOnTheBackend() {
        InventoryRepository inventories = mock(InventoryRepository.class);
        ProductVariantRepository variants = mock(ProductVariantRepository.class);
        ProductVariant variant = new ProductVariant();
        variant.setId(10L);
        Inventory saved = new Inventory();
        saved.setId(3L);
        saved.setQuantity(20);
        saved.setReservedQuantity(4);
        saved.setReOrderLevel(5);
        saved.setAvailableQuantity(16);
        saved.setProductVariant(variant);

        when(variants.findById(10L)).thenReturn(java.util.Optional.of(variant));
        when(inventories.existsByProductVariantId(10L)).thenReturn(false);
        when(inventories.saveAndFlush(any(Inventory.class))).thenReturn(saved);

        InventoryServiceImpl service = new InventoryServiceImpl(inventories, variants);
        var response = service.createInventory(new InventoryRequestDto(20, 4, 5, 10L));

        assertEquals(16, response.getAvailableQuantity());
        verify(inventories).saveAndFlush(argThat(inventory ->
                inventory.getAvailableQuantity() == 16
        ));
    }

    @Test
    void rejectsDuplicateInventoryForAProductVariant() {
        InventoryRepository inventories = mock(InventoryRepository.class);
        ProductVariantRepository variants = mock(ProductVariantRepository.class);
        ProductVariant variant = new ProductVariant();
        variant.setId(10L);

        when(variants.findById(10L)).thenReturn(java.util.Optional.of(variant));
        when(inventories.existsByProductVariantId(10L)).thenReturn(true);

        InventoryServiceImpl service = new InventoryServiceImpl(inventories, variants);

        assertThrows(BusinessConflictException.class, () ->
                service.createInventory(new InventoryRequestDto(20, 0, 5, 10L))
        );
        verify(inventories, never()).saveAndFlush(any(Inventory.class));
    }

    @Test
    void rejectsReservedQuantityGreaterThanTotalQuantity() {
        InventoryRepository inventories = mock(InventoryRepository.class);
        ProductVariantRepository variants = mock(ProductVariantRepository.class);
        InventoryServiceImpl service = new InventoryServiceImpl(inventories, variants);

        assertThrows(BusinessConflictException.class, () ->
                service.createInventory(new InventoryRequestDto(2, 3, 5, 10L))
        );
        verifyNoInteractions(variants, inventories);
    }

    @Test
    void rejectsNegativeStockQuantities() {
        InventoryRepository inventories = mock(InventoryRepository.class);
        ProductVariantRepository variants = mock(ProductVariantRepository.class);
        InventoryServiceImpl service = new InventoryServiceImpl(inventories, variants);

        assertThrows(BusinessConflictException.class, () ->
                service.createInventory(new InventoryRequestDto(-1, 0, 5, 10L))
        );
        verifyNoInteractions(variants, inventories);
    }

    @Test
    void allowsZeroInitialStock() {
        InventoryRepository inventories = mock(InventoryRepository.class);
        ProductVariantRepository variants = mock(ProductVariantRepository.class);
        ProductVariant variant = new ProductVariant();
        variant.setId(10L);
        Inventory saved = new Inventory();
        saved.setId(4L);
        saved.setQuantity(0);
        saved.setReservedQuantity(0);
        saved.setReOrderLevel(5);
        saved.setAvailableQuantity(0);
        saved.setProductVariant(variant);

        when(variants.findById(10L)).thenReturn(java.util.Optional.of(variant));
        when(inventories.existsByProductVariantId(10L)).thenReturn(false);
        when(inventories.saveAndFlush(any(Inventory.class))).thenReturn(saved);

        InventoryServiceImpl service = new InventoryServiceImpl(inventories, variants);
        var response = service.createInventory(new InventoryRequestDto(0, 0, 5, 10L));

        assertEquals(0, response.getAvailableQuantity());
    }

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
