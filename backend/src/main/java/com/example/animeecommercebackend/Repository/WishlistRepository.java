package com.example.animeecommercebackend.Repository;

import com.example.animeecommercebackend.Entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist,Long> {
    List<Wishlist> findByUserId(Long userId);

    List<Wishlist> findByProductsId(Long productId);
}
