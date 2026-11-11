package com.example.animeecommercebackend.Repository;

import com.example.animeecommercebackend.Entity.Product;
import com.example.animeecommercebackend.Entity.Enums.OrderStatus;
import com.example.animeecommercebackend.Entity.Enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {
    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByBrandId(Long brandId);

    List<Product> findBySeriesId(Long seriesId);

    long countByCategoryId(Long categoryId);

    long countByBrandId(Long brandId);

    @Query("select case when count(oi) > 0 then true else false end " +
           "from OrderItem oi where oi.productVariant.product.id = :productId " +
           "and oi.order.status in :statuses")
    boolean existsHistoricalOrderReference(
            @Param("productId") Long productId,
            @Param("statuses") List<OrderStatus> statuses);

    List<Product> findByStatusNot(ProductStatus status);

    Page<Product> findByStatusNot(ProductStatus status, Pageable pageable);

    List<Product> findByStatus(ProductStatus status);
}
