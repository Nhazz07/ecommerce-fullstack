package com.example.animeecommercebackend.Repository;

import com.example.animeecommercebackend.Entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant,Long> {
    List<ProductVariant> findByProductId(Long productId);
    List<ProductVariant> findAllByIdIn(List<Long> ids);
    boolean existsBySku(String sku);
}
