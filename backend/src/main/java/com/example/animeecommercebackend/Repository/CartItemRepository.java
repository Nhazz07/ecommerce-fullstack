package com.example.animeecommercebackend.Repository;

import com.example.animeecommercebackend.Entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    void deleteByProductVariantId(Long productVariantId);
}
