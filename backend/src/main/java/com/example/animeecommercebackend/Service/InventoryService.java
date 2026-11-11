package com.example.animeecommercebackend.Service;

import com.example.animeecommercebackend.Dto.Request.InventoryRequestDto;
import com.example.animeecommercebackend.Dto.Response.InventoryResponseDto;
import com.example.animeecommercebackend.Entity.Order;

import java.util.List;

public interface InventoryService {
    InventoryResponseDto createInventory(InventoryRequestDto dto);
    InventoryResponseDto getInventoryById(Long id);
    InventoryResponseDto getInventoryByProductVariantId(Long productVariantId);
    List<InventoryResponseDto> getAllInventory();
    InventoryResponseDto updateInventory(Long id, InventoryRequestDto dto);
    void deleteInventory(Long id);
    boolean hasEnoughStock(Long productVariantId, int quantity);
    void decreaseStock(Long productVariantId, int quantity);

    void reserveOrderStock(Order order);

    void commitOrderStock(Order order);

    void releaseOrderStock(Order order);

    void restockOrderStock(Order order);

}
