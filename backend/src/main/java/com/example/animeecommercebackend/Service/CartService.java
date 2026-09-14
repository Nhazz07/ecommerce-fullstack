package com.example.animeecommercebackend.Service;

import com.example.animeecommercebackend.Dto.Request.CartRequestDto;
import com.example.animeecommercebackend.Dto.Response.CartResponseDto;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;

public interface CartService {

    CartResponseDto createCart(
            CartRequestDto dto,
            String cartToken
    ) throws AccessDeniedException;

    CartResponseDto getCartById(
            Long id,
            String cartToken
    ) throws AccessDeniedException;

    List<CartResponseDto> getAllCart();

    List<CartResponseDto> getCartByUserId(
            Long userId
    ) throws AccessDeniedException;

    CartResponseDto updateCart(
            Long id,
            CartRequestDto dto,
            String cartToken
    ) throws AccessDeniedException;

    void deleteCart(
            Long id,
            String cartToken
    ) throws AccessDeniedException;

    CartResponseDto addProductVariant(
            Long cartId,
            Long productVariantId,
            String cartToken
    ) throws AccessDeniedException;

    CartResponseDto removeProductVariant(
            Long cartId,
            Long productVariantId,
            String cartToken
    ) throws AccessDeniedException;
}