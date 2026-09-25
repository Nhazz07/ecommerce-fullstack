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
    public CartResponseDto createCart(
            CartRequestDto dto,
            String cartToken
    ) {

        User currentUser = getAuthenticatedUserOrNull();

        ProductVariant productVariant =
                getProductVariant(dto.getProductVariantId());

        Cart cart;

        // =========================
        // AUTHENTICATED USER CART
        // =========================
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

        }

        // =========================
        // GUEST USER CART
        // =========================
        else {

            cart = getGuestCart(cartToken);

            if (cart == null) {

                cart = new Cart();
                cart.setCartToken(UUID.randomUUID().toString());

                cart = cartRepository.save(cart);
            }
        }

        // =========================
        // FIND EXISTING ITEM
        // =========================
        CartItem existingCartItem =
                findCartItem(cart, productVariant);

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

        return saveAndMap(cart);
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponseDto getCartById(
            Long id,
            String cartToken
    ) {

        Cart cart = getCart(id);

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
            String cartToken
    ) {

        Cart cart = getCart(id);

        checkCartOwnership(cart, cartToken);

        ProductVariant productVariant =
                getProductVariant(dto.getProductVariantId());

        CartItem existingCartItem =
                findCartItem(cart, productVariant);

        if (existingCartItem != null) {

            existingCartItem.setQuantity(dto.getQuantity());

        } else {

            CartItem cartItem = new CartItem();

            cartItem.setCart(cart);
            cartItem.setProductVariant(productVariant);
            cartItem.setQuantity(dto.getQuantity());

            cart.getCartItems().add(cartItem);
        }

        return saveAndMap(cart);
    }

    @Override
    @Transactional
    public void deleteCart(
            Long id,
            String cartToken
    ) throws AccessDeniedException {

        Cart cart = getCart(id);

        checkCartOwnership(cart, cartToken);

        cartRepository.delete(cart);
    }

    @Override
    @Transactional
    public CartResponseDto addProductVariant(
            Long cartId,
            Long productVariantId,
            String cartToken
    ) {

        Cart cart = getCart(cartId);

        checkCartOwnership(cart, cartToken);

        ProductVariant productVariant =
                getProductVariant(productVariantId);

        CartItem existingCartItem =
                findCartItem(cart, productVariant);

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

        return saveAndMap(cart);
    }

    @Override
    @Transactional
    public CartResponseDto removeProductVariant(
            Long cartId,
            Long productVariantId,
            String cartToken
    ) {

        Cart cart = getCart(cartId);

        // Check that the current user/guest owns this cart
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

        return saveAndMap(cart);
    }

    // ==========================================
    // PRODUCT VARIANT LOOKUP
    // ==========================================

    private ProductVariant getProductVariant(
            Long productVariantId
    ) {

        return productVariantRepository.findById(productVariantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product Variant Not Found!"
                        )
                );
    }

    // ==========================================
    // CART LOOKUP
    // ==========================================

    private Cart getCart(Long id) {

        return cartRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart Not Found!"
                        )
                );
    }

    // ==========================================
    // GUEST CART LOOKUP
    // ==========================================

    private Cart getGuestCart(String cartToken) {

        if (cartToken == null || cartToken.isBlank()) {
            return null;
        }

        return cartRepository.findByCartToken(cartToken)
                .orElse(null);
    }

    // ==========================================
    // FIND CART ITEM
    // ==========================================

    private CartItem findCartItem(
            Cart cart,
            ProductVariant productVariant
    ) {

        return cart.getCartItems()
                .stream()
                .filter(item ->
                        item.getProductVariant()
                                .getId()
                                .equals(productVariant.getId())
                )
                .findFirst()
                .orElse(null);
    }

    // ==========================================
    // SAVE + MAP
    // ==========================================

    private CartResponseDto saveAndMap(Cart cart) {

        Cart savedCart = cartRepository.save(cart);

        return CartMapper.toResponse(savedCart);
    }

    // ==========================================
    // GET AUTHENTICATED USER
    // ==========================================

    private User getAuthenticatedUserOrNull() {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(
                authentication.getPrincipal()
        )) {

            return null;
        }

        return currentUserService.getCurrentUser();
    }

    // ==========================================
    // CART OWNERSHIP
    // ==========================================

    private void checkCartOwnership(
            Cart cart,
            String cartToken
    ) {

        // ======================================
        // AUTHENTICATED USER CART
        // ======================================

        if (cart.getUser() != null) {

            User currentUser = getAuthenticatedUserOrNull();

            if (currentUser == null) {
                throw new AccessDeniedException(
                        "You must be logged in to access this cart"
                );
            }

            if (!cart.getUser().getId()
                    .equals(currentUser.getId())) {

                throw new AccessDeniedException(
                        "You cannot access this cart"
                );
            }

            return;
        }

        // ======================================
        // GUEST CART
        // ======================================

        if (cart.getCartToken() == null
                || cartToken == null
                || !cart.getCartToken().equals(cartToken)) {

            throw new AccessDeniedException(
                    "Invalid cart token"
            );
        }
    }
}