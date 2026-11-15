package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Dto.Request.InventoryRequestDto;
import com.example.animeecommercebackend.Dto.Response.InventoryResponseDto;
import com.example.animeecommercebackend.Entity.Inventory;
import com.example.animeecommercebackend.Entity.ProductVariant;
import com.example.animeecommercebackend.Entity.Order;
import com.example.animeecommercebackend.Entity.OrderItem;
import com.example.animeecommercebackend.Exception.BusinessConflictException;
import com.example.animeecommercebackend.Exception.ResourceNotFoundException;
import com.example.animeecommercebackend.Mapper.InventoryMapper;
import com.example.animeecommercebackend.Repository.InventoryRepository;
import com.example.animeecommercebackend.Repository.ProductVariantRepository;
import com.example.animeecommercebackend.Service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    @Transactional
    public InventoryResponseDto createInventory(InventoryRequestDto dto) {
        validateStockQuantities(dto);

        ProductVariant productVariant = productVariantRepository
                .findById(dto.getProductVariantId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product Variant Not Found"));

        if (inventoryRepository.existsByProductVariantId(dto.getProductVariantId())) {
            throw new BusinessConflictException(
                    "Inventory already exists for product variant " + dto.getProductVariantId()
            );
        }

        Inventory inventory = InventoryMapper.toEntity(dto);
        inventory.setProductVariant(productVariant);
        recalculate(inventory);

        Inventory saved;
        try {
            // Flush here so a concurrent create also becomes a 409 instead of leaking a
            // database exception after the service method has returned.
            saved = inventoryRepository.saveAndFlush(inventory);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessConflictException(
                    "Inventory already exists for product variant " + dto.getProductVariantId()
            );
        }

        return InventoryMapper.toResponse(saved);
    }

    @Override
    public InventoryResponseDto getInventoryById(Long id) {

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Inventory Not Found!"));

        return InventoryMapper.toResponse(inventory);
    }

    @Override
    public InventoryResponseDto getInventoryByProductVariantId(Long productVariantId) {

        Inventory inventory = inventoryRepository.findByProductVariantId(productVariantId);

        if (inventory == null) {
            throw new ResourceNotFoundException("Inventory Not Found");
        }

        return InventoryMapper.toResponse(inventory);
    }

    @Override
    public List<InventoryResponseDto> getAllInventory() {

        return inventoryRepository.findAll()
                .stream()
                .map(InventoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public InventoryResponseDto updateInventory(Long id, InventoryRequestDto dto) {
        validateStockQuantities(dto);

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Inventory Not Found!!"));

        inventory.setQuantity(dto.getQuantity());
        inventory.setReservedQuantity(dto.getReservedQuantity());
        inventory.setReOrderLevel(dto.getReorderLevel());

        recalculate(inventory);

        Inventory updated = inventoryRepository.save(inventory);

        return InventoryMapper.toResponse(updated);
    }

    @Override
    public void deleteInventory(Long id) {

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Inventory Not Found"));

        inventoryRepository.delete(inventory);
    }

    @Override
    public boolean hasEnoughStock(Long productVariantId, int quantity) {
        Inventory inventory =
                inventoryRepository.findByProductVariantId(productVariantId);
        if(inventory == null){
            throw new ResourceNotFoundException("Inventory Not Found");
        }
        return inventory.getAvailableQuantity() >= quantity;
    }

    @Override
    public void decreaseStock(Long productVariantId, int quantity) {
        Inventory inventory = inventoryRepository.findByProductVariantIdForUpdate(productVariantId);
        if(inventory == null){
            throw new ResourceNotFoundException("Inventory Not Found");
        }
        if(inventory.getAvailableQuantity() < quantity){
            throw new RuntimeException("Not Enough Stock!");
        }
        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventory.setAvailableQuantity(inventory.getQuantity() - inventory.getReservedQuantity());

        inventoryRepository.save(inventory);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void reserveOrderStock(Order order) {
        if (order.isInventoryReserved() || order.isInventoryCommitted()) {
            return;
        }

        for (OrderItem item : sortedItems(order)) {
            Inventory inventory = lockedInventory(item);
            int available = inventory.getQuantity() - inventory.getReservedQuantity();
            if (available < item.getQuantity()) {
                throw new BusinessConflictException(
                        "Insufficient stock for product variant "
                                + item.getProductVariant().getId() + "."
                );
            }
            inventory.setReservedQuantity(inventory.getReservedQuantity() + item.getQuantity());
            recalculate(inventory);
            inventoryRepository.save(inventory);
        }
        order.setInventoryReserved(true);
        order.setInventoryReleased(false);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void commitOrderStock(Order order) {
        if (order.isInventoryCommitted()) {
            return;
        }
        if (!order.isInventoryReserved()) {
            throw new BusinessConflictException("Order inventory is not reserved.");
        }

        for (OrderItem item : sortedItems(order)) {
            Inventory inventory = lockedInventory(item);
            if (inventory.getReservedQuantity() < item.getQuantity()
                    || inventory.getQuantity() < item.getQuantity()) {
                throw new BusinessConflictException("Inventory reservation is inconsistent.");
            }
            inventory.setQuantity(inventory.getQuantity() - item.getQuantity());
            inventory.setReservedQuantity(inventory.getReservedQuantity() - item.getQuantity());
            recalculate(inventory);
            inventoryRepository.save(inventory);
        }
        order.setInventoryReserved(false);
        order.setInventoryCommitted(true);
        order.setInventoryReleased(false);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void releaseOrderStock(Order order) {
        if (order.isInventoryReleased() || order.isInventoryCommitted()) {
            return;
        }
        if (!order.isInventoryReserved()) {
            order.setInventoryReleased(true);
            return;
        }

        for (OrderItem item : sortedItems(order)) {
            Inventory inventory = lockedInventory(item);
            if (inventory.getReservedQuantity() < item.getQuantity()) {
                throw new BusinessConflictException("Inventory reservation is inconsistent.");
            }
            inventory.setReservedQuantity(inventory.getReservedQuantity() - item.getQuantity());
            recalculate(inventory);
            inventoryRepository.save(inventory);
        }
        order.setInventoryReserved(false);
        order.setInventoryReleased(true);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void restockOrderStock(Order order) {
        if (!order.isInventoryCommitted() || order.isInventoryReleased()) {
            return;
        }
        for (OrderItem item : sortedItems(order)) {
            Inventory inventory = lockedInventory(item);
            inventory.setQuantity(inventory.getQuantity() + item.getQuantity());
            recalculate(inventory);
            inventoryRepository.save(inventory);
        }
        order.setInventoryCommitted(false);
        order.setInventoryReleased(true);
    }

    private Inventory lockedInventory(OrderItem item) {
        Inventory inventory = inventoryRepository.findByProductVariantIdForUpdate(
                item.getProductVariant().getId()
        );
        if (inventory == null) {
            throw new ResourceNotFoundException(
                    "Inventory Not Found for product variant " + item.getProductVariant().getId()
            );
        }
        return inventory;
    }

    private List<OrderItem> sortedItems(Order order) {
        return order.getOrderItems().stream()
                .sorted(Comparator.comparing(item -> item.getProductVariant().getId()))
                .toList();
    }

    private void recalculate(Inventory inventory) {
        int available = inventory.getQuantity() - inventory.getReservedQuantity();
        if (available < 0) {
            throw new BusinessConflictException("Inventory cannot become negative.");
        }
        inventory.setAvailableQuantity(available);
    }

    private void validateStockQuantities(InventoryRequestDto dto) {
        if (dto.getQuantity() == null || dto.getReservedQuantity() == null || dto.getReorderLevel() == null) {
            throw new BusinessConflictException("All stock quantities are required.");
        }
        if (dto.getQuantity() < 0 || dto.getReservedQuantity() < 0 || dto.getReorderLevel() < 0) {
            throw new BusinessConflictException("Stock quantities cannot be negative.");
        }
        if (dto.getReservedQuantity() > dto.getQuantity()) {
            throw new BusinessConflictException(
                    "Reserved quantity cannot exceed total quantity."
            );
        }
    }
}
