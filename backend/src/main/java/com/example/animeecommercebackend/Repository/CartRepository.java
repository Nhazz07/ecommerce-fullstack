package com.example.animeecommercebackend.Repository;

import com.example.animeecommercebackend.Entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByCartToken(String cartToken);
}