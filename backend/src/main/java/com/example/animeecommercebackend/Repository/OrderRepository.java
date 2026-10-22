package com.example.animeecommercebackend.Repository;

import com.example.animeecommercebackend.Entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order,Long> {
    @EntityGraph(attributePaths = {
            "orderItems",
            "orderItems.productVariant",
            "orderItems.productVariant.product"
    })
    Order findOrderByUserId(long userId);

    @EntityGraph(attributePaths = {
            "orderItems",
            "orderItems.productVariant",
            "orderItems.productVariant.product"
    })
    List<Order> findByUserId(Long userId);

    @EntityGraph(attributePaths = {
            "orderItems",
            "orderItems.productVariant",
            "orderItems.productVariant.product"
    })
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findWithOrderItemsById(@Param("id") Long id);

    @Override
    @EntityGraph(attributePaths = {
            "orderItems",
            "orderItems.productVariant",
            "orderItems.productVariant.product"
    })
    List<Order> findAll();
}
