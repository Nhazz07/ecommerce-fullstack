package com.example.animeecommercebackend.Repository;

import com.example.animeecommercebackend.Entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory,Long> {
    Inventory findByProductVariantId(Long productVariantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Inventory i where i.productVariant.id = :productVariantId")
    Inventory findByProductVariantIdForUpdate(@Param("productVariantId") Long productVariantId);

    void deleteByProductVariantId(Long productVariantId);
}
