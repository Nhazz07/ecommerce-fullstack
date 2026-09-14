package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Dto.Request.CartRequestDto;
import com.example.animeecommercebackend.Dto.Response.CartResponseDto;
import com.example.animeecommercebackend.Entity.*;
import com.example.animeecommercebackend.Exception.ResourceNotFoundException;
import com.example.animeecommercebackend.Mapper.CartMapper;
import com.example.animeecommercebackend.Repository.CartRepository;
import com.example.animeecommercebackend.Repository.ProductRepository;
import com.example.animeecommercebackend.Repository.ProductVariantRepository;
import com.example.animeecommercebackend.Repository.UserRepository;
import com.example.animeecommercebackend.Service.CartService;
import com.example.animeecommercebackend.Service.CurrentUserService;
import org.springframework.security.access.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CurrentUserService currentUserService;


    @Override
    public CartResponseDto createCart(CartRequestDto dto) {

        User currentUser;

        // Check if a user is authenticated
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null &&
                authentication.isAuthenticated() &&
                !authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ANONYMOUS"))) {

            currentUser = currentUserService.getCurrentUser();
        } else {
            currentUser = null;
        }

        ProductVariant productVariant =
                productVariantRepository.findById(dto.getProductVariantId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product Variant Not Found!"
                                ));

        Cart cart;

        // 1. Find existing cart for authenticated user
        if (currentUser != null) {

            cart = cartRepository.findFirstByUserId(currentUser.getId())
                    .orElseGet(() -> {

                        Cart newCart = new Cart();
                        newCart.setUser(currentUser);
                        newCart.setCartToken(UUID.randomUUID().toString());

                        return newCart;
                    });

        } else {

            // 2. Create a new guest cart
            cart = new Cart();
            cart.setCartToken(UUID.randomUUID().toString());
        }

        // 3. Check if this product variant is already in cart
        CartItem existingCartItem = cart.getCartItems()
                .stream()
                .filter(item ->
                        item.getProductVariant()
                                .getId()
                                .equals(productVariant.getId())
                )
                .findFirst()
                .orElse(null);

        if (existingCartItem != null) {

            // Variant already exists, increase quantity
            existingCartItem.setQuantity(
                    existingCartItem.getQuantity() + dto.getQuantity()
            );

        } else {

            // Variant does not exist, create a new cart item
            CartItem cartItem = new CartItem();

            cartItem.setCart(cart);
            cartItem.setProductVariant(productVariant);
            cartItem.setQuantity(dto.getQuantity());

            cart.getCartItems().add(cartItem);
        }

        Cart savedCart = cartRepository.save(cart);

        return CartMapper.toResponse(savedCart);
    }

    @Override
    public CartResponseDto getCartById(
            Long id,
            String cartToken) {

        Cart cart = cartRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart Not Found!!"
                        ));

        checkCartOwnership(cart, cartToken);

        return CartMapper.toResponse(cart);
    }


    @Override
    public List<CartResponseDto> getAllCart() {

        List<Cart> carts = cartRepository.findAll();

        if (carts.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Cart Not Found!!"
            );
        }

        return carts
                .stream()
                .map(CartMapper::toResponse)
                .toList();
    }


    @Override
    public List<CartResponseDto> getCartByUserId(
            Long userId) throws AccessDeniedException {

        User currentUser = currentUserService.getCurrentUser();

        if (!currentUser.getId().equals(userId)) {
            throw new AccessDeniedException(
                    "You cannot access another user's cart"
            );
        }

        List<Cart> carts =
                cartRepository.findByUserId(userId);

        if (carts.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Cart Not Found!"
            );
        }

        return carts
                .stream()
                .map(CartMapper::toResponse)
                .toList();
    }


    @Override
    public CartResponseDto updateCart(
            Long id,
            CartRequestDto dto,
            String cartToken) {

        Cart cart = cartRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart Not Found"
                        ));

        checkCartOwnership(cart, cartToken);

        List<ProductVariant> productVariants =
                productVariantRepository.findAllById(
                        List.of(dto.getProductVariantId())
                );

        if (productVariants.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No Product Variant Found!"
            );
        }

        for (ProductVariant productVariant : productVariants) {

            CartItem cartItem = new CartItem();

            cartItem.setCart(cart);
            cartItem.setProductVariant(productVariant);
            cartItem.setQuantity(1);

            cart.getCartItems().add(cartItem);
        }

        Cart updated = cartRepository.save(cart);

        return CartMapper.toResponse(updated);
    }


    @Override
    public void deleteCart(
            Long id,
            String cartToken) throws AccessDeniedException {

        Cart cart = cartRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart Not Found"
                        ));

        checkCartOwnership(cart, cartToken);

        cartRepository.delete(cart);
    }


    @Override
    public CartResponseDto addProductVariant(
            Long cartId,
            Long productVariantId,
            String cartToken) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart Not Found"
                        ));

        checkCartOwnership(cart, cartToken);

        ProductVariant productVariant =
                productVariantRepository.findById(productVariantId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product Variant Not Found!"
                                ));

        CartItem cartItem = new CartItem();

        cartItem.setCart(cart);
        cartItem.setProductVariant(productVariant);
        cartItem.setQuantity(1);

        cart.getCartItems().add(cartItem);

        Cart updated = cartRepository.save(cart);

        return CartMapper.toResponse(updated);
    }


    @Override
    public CartResponseDto removeProductVariant(
            Long cartId,
            Long productVariantId,
            String cartToken) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart Not Found"
                        ));

        checkCartOwnership(cart, cartToken);

        CartItem cartItem = cart.getCartItems()
                .stream()
                .filter(item ->
                        item.getProductVariant()
                                .getId()
                                .equals(productVariantId)
                )
                .findFirst()
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product Variant is not in the cart"
                        )
                );

        cart.getCartItems().remove(cartItem);

        Cart updated = cartRepository.save(cart);

        return CartMapper.toResponse(updated);
    }

    private void checkCartOwnership(
            Cart cart,
            String cartToken) {

        // Customer cart
        if (cart.getUser() != null) {

            User currentUser =
                    currentUserService.getCurrentUser();

            if (!cart.getUser().getId()
                    .equals(currentUser.getId())) {

                throw new AccessDeniedException(
                        "You cannot access this cart"
                );
            }

            return;
        }

        // Guest cart
        if (cart.getCartToken() == null ||
                cartToken == null ||
                !cart.getCartToken().equals(cartToken)) {

            throw new AccessDeniedException(
                    "Invalid cart token"
            );
        }
    }
}