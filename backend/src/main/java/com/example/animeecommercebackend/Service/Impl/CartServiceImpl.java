package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Dto.Request.CartRequestDto;
import com.example.animeecommercebackend.Dto.Response.CartResponseDto;
import com.example.animeecommercebackend.Entity.Cart;
import com.example.animeecommercebackend.Entity.CartItem;
import com.example.animeecommercebackend.Entity.ProductVariant;
import com.example.animeecommercebackend.Entity.User;
import com.example.animeecommercebackend.Exception.ResourceNotFoundException;
import com.example.animeecommercebackend.Mapper.CartMapper;
import com.example.animeecommercebackend.Repository.CartRepository;
import com.example.animeecommercebackend.Repository.ProductVariantRepository;
import com.example.animeecommercebackend.Repository.UserRepository;
import com.example.animeecommercebackend.Service.CartService;
import com.example.animeecommercebackend.Service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CartResponseDto createCart(CartRequestDto dto) {

        User currentUser = getAuthenticatedUserOrNull();

        ProductVariant productVariant =
                productVariantRepository.findById(dto.getProductVariantId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product Variant Not Found!"
                                ));

        Cart cart;

        if (currentUser != null) {

            cart = currentUser.getCart();

            if (cart == null) {

                cart = new Cart();
                cart.setCartToken(null);
                cart.setUser(currentUser);

                cart = cartRepository.save(cart);

                currentUser.setCart(cart);
                userRepository.save(currentUser);
            }

        } else {

            cart = new Cart();
            cart.setCartToken(UUID.randomUUID().toString());
            cart = cartRepository.save(cart);
        }

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

            existingCartItem.setQuantity(
                    existingCartItem.getQuantity() + dto.getQuantity()
            );

        } else {

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
    @Transactional(readOnly = true)
    public CartResponseDto getCartById(Long id, String cartToken) {

        Cart cart = cartRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart Not Found!"
                        ));

        checkCartOwnership(cart, cartToken);

        return CartMapper.toResponse(cart);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CartResponseDto> getAllCart() {

        List<Cart> carts = cartRepository.findAll();

        if (carts.isEmpty()) {
            throw new ResourceNotFoundException("Cart Not Found!");
        }

        return carts.stream()
                .map(CartMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CartResponseDto> getCartByUserId(Long userId)
            throws AccessDeniedException {

        User currentUser = currentUserService.getCurrentUser();

        if (!currentUser.getId().equals(userId)) {
            throw new AccessDeniedException(
                    "You cannot access another user's cart"
            );
        }

        Cart cart = currentUser.getCart();

        if (cart == null) {
            throw new ResourceNotFoundException("Cart Not Found!");
        }

        return List.of(CartMapper.toResponse(cart));
    }

    @Override
    @Transactional
    public CartResponseDto updateCart(
            Long id,
            CartRequestDto dto,
            String cartToken) {

        Cart cart = cartRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart Not Found!"
                        ));

        checkCartOwnership(cart, cartToken);

        ProductVariant productVariant =
                productVariantRepository.findById(dto.getProductVariantId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product Variant Not Found!"
                                ));

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

            existingCartItem.setQuantity(dto.getQuantity());

        } else {

            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProductVariant(productVariant);
            cartItem.setQuantity(dto.getQuantity());

            cart.getCartItems().add(cartItem);
        }

        Cart updatedCart = cartRepository.save(cart);

        return CartMapper.toResponse(updatedCart);
    }

    @Override
    @Transactional
    public void deleteCart(Long id, String cartToken)
            throws AccessDeniedException {

        Cart cart = cartRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart Not Found!"
                        ));

        checkCartOwnership(cart, cartToken);

        cartRepository.delete(cart);
    }

    @Override
    @Transactional
    public CartResponseDto addProductVariant(
            Long cartId,
            Long productVariantId,
            String cartToken) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart Not Found!"
                        ));

        checkCartOwnership(cart, cartToken);

        ProductVariant productVariant =
                productVariantRepository.findById(productVariantId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product Variant Not Found!"
                                ));

        CartItem existingCartItem = cart.getCartItems()
                .stream()
                .filter(item ->
                        item.getProductVariant()
                                .getId()
                                .equals(productVariantId)
                )
                .findFirst()
                .orElse(null);

        if (existingCartItem != null) {

            existingCartItem.setQuantity(
                    existingCartItem.getQuantity() + 1
            );

        } else {

            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProductVariant(productVariant);
            cartItem.setQuantity(1);

            cart.getCartItems().add(cartItem);
        }

        Cart updatedCart = cartRepository.save(cart);

        return CartMapper.toResponse(updatedCart);
    }

    @Override
    @Transactional
    public CartResponseDto removeProductVariant(
            Long cartId,
            Long productVariantId,
            String cartToken) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart Not Found!"
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
                        ));

        cart.getCartItems().remove(cartItem);

        Cart updatedCart = cartRepository.save(cart);

        return CartMapper.toResponse(updatedCart);
    }

    private User getAuthenticatedUserOrNull() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        System.out.println("AUTHENTICATION: " + authentication);
        System.out.println("PRINCIPAL: " +
                (authentication != null ? authentication.getPrincipal() : null));
        System.out.println("USERNAME: " +
                (authentication != null ? authentication.getName() : null));
        System.out.println("AUTHORITIES: " +
                (authentication != null ? authentication.getAuthorities() : null));

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }

        return currentUserService.getCurrentUser();
    }

    private void checkCartOwnership(Cart cart, String cartToken) {

        if (cart.getUser() != null) {

            User currentUser = currentUserService.getCurrentUser();

            if (!cart.getUser().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException(
                        "You cannot access this cart"
                );
            }

            return;
        }

        if (cart.getCartToken() == null
                || cartToken == null
                || !cart.getCartToken().equals(cartToken)) {
            throw new AccessDeniedException("Invalid cart token");
        }
    }
}