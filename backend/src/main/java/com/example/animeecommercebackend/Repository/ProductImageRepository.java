package com.example.animeecommercebackend.Repository;

import com.example.animeecommercebackend.Entity.ProductImages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImages,Long> {
    List<ProductImages> findByProductId(Long productId);
}
