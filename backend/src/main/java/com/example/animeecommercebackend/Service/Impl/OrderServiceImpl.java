package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Dto.Request.OrderRequestDto;
import com.example.animeecommercebackend.Dto.Response.OrderResponseDto;
import com.example.animeecommercebackend.Entity.Cart;
import com.example.animeecommercebackend.Entity.CartItem;
import com.example.animeecommercebackend.Entity.Order;
import com.example.animeecommercebackend.Entity.OrderItem;
import com.example.animeecommercebackend.Entity.ProductVariant;
import com.example.animeecommercebackend.Entity.User;
import com.example.animeecommercebackend.Entity.Enums.OrderStatus;
import com.example.animeecommercebackend.Exception.ResourceNotFoundException;
import com.example.animeecommercebackend.Mapper.OrderMapper;
import com.example.animeecommercebackend.Repository.OrderRepository;
import com.example.animeecommercebackend.Service.CouponService;
import com.example.animeecommercebackend.Service.CurrentUserService;
import com.example.animeecommercebackend.Service.InventoryService;
import com.example.animeecommercebackend.Service.OrderService;
import com.example.animeecommercebackend.Service.PromotionService;
import com.example.animeecommercebackend.Service.ShipmentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CurrentUserService currentUserService;
    private final InventoryService inventoryService;
    private final PromotionService promotionService;
    private final CouponService couponService;
    private final ShipmentService shipmentService;

    @Transactional
    @Override
    public OrderResponseDto createOrder(OrderRequestDto dto) {

        // 1. Get the currently authenticated customer
        User user = currentUserService.getCurrentUser();

        // 2. Get the cart connected to the current user
        Cart cart = user.getCart();

        if (cart == null) {
            throw new ResourceNotFoundException("Cart Not Found!");
        }

        // 3. Check whether the cart contains any items
        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new ResourceNotFoundException("Cart Is Empty!");
        }

        // 4. Create the order
        Order order = new Order();

        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderNumber((int) (Math.random() * 90000000) + 10000000);
        order.setOrderDate(LocalDateTime.now());
        order.setShippingAddress(dto.getShippingAddress());

        BigDecimal subTotal = BigDecimal.ZERO;

        List<OrderItem> orderItems = new ArrayList<>();

        // 5. Validate stock and create order items
        for (CartItem cartItem : cart.getCartItems()) {

            ProductVariant variant = cartItem.getProductVariant();

            if (variant == null) {
                throw new ResourceNotFoundException(
                        "Product Variant Not Found!"
                );
            }

            int quantity = cartItem.getQuantity();

            if (quantity <= 0) {
                throw new IllegalArgumentException(
                        "Cart item quantity must be greater than zero!"
                );
            }

            // 6. Check inventory before creating the order
            if (!inventoryService.hasEnoughStock(
                    variant.getId(),
                    quantity
            )) {
                throw new RuntimeException(
                        "Not Enough Stock for product variant: "
                                + variant.getId()
                );
            }

            // 7. Get the current product variant price
            BigDecimal unitPrice = variant.getPrice();

            if (unitPrice == null) {
                throw new IllegalArgumentException(
                        "Product variant price cannot be null!"
                );
            }

            // 8. Calculate product promotion discount
            BigDecimal promotionDiscount =
                    promotionService.calculateDiscount(
                            variant.getProduct().getId(),
                            unitPrice
                    );

            if (promotionDiscount == null) {
                promotionDiscount = BigDecimal.ZERO;
            }

            // Prevent the promotion discount from being negative
            if (promotionDiscount.compareTo(BigDecimal.ZERO) < 0) {
                promotionDiscount = BigDecimal.ZERO;
            }

            // Prevent the promotion discount from exceeding the unit price
            if (promotionDiscount.compareTo(unitPrice) > 0) {
                promotionDiscount = unitPrice;
            }

            BigDecimal finalUnitPrice =
                    unitPrice.subtract(promotionDiscount);

            // 9. Calculate item subtotal
            BigDecimal itemSubtotal =
                    finalUnitPrice.multiply(
                            BigDecimal.valueOf(quantity)
                    );

            // 10. Create the order item
            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setProductVariant(variant);
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(finalUnitPrice);
            orderItem.setSubTotal(itemSubtotal);

            orderItems.add(orderItem);

            subTotal = subTotal.add(itemSubtotal);
        }

        // 11. Attach order items to the order
        order.setOrderItems(orderItems);
        order.setSubTotal(subTotal);

        // 12. Calculate coupon discount
        BigDecimal couponDiscount = BigDecimal.ZERO;

        if (dto.getCouponId() != null) {

            couponDiscount = couponService.calculateDiscount(
                    dto.getCouponId(),
                    subTotal
            );

            if (couponDiscount == null) {
                couponDiscount = BigDecimal.ZERO;
            }
        }

        // Prevent negative coupon discounts
        if (couponDiscount.compareTo(BigDecimal.ZERO) < 0) {
            couponDiscount = BigDecimal.ZERO;
        }

        // Prevent coupon discount from exceeding subtotal
        if (couponDiscount.compareTo(subTotal) > 0) {
            couponDiscount = subTotal;
        }

        order.setDiscountAmount(couponDiscount);

        // 13. Calculate shipping fee
        BigDecimal shippingFee =
                shipmentService.calculateShipmentFee(subTotal);

        if (shippingFee == null) {
            shippingFee = BigDecimal.ZERO;
        }

        order.setShippingFee(shippingFee);

        // 14. Calculate final total
        BigDecimal totalAmount = subTotal
                .subtract(couponDiscount)
                .add(shippingFee);

        order.setTotalAmount(totalAmount);

        // 15. Save the order
        Order savedOrder = orderRepository.save(order);

        // 16. Decrease inventory after the order is saved
        for (CartItem cartItem : cart.getCartItems()) {

            ProductVariant variant = cartItem.getProductVariant();

            inventoryService.decreaseStock(
                    variant.getId(),
                    cartItem.getQuantity()
            );
        }

        // 17. Clear the cart after successful order creation
        cart.getCartItems().clear();

        // Because Cart is managed inside the transaction,
        // the cart changes will be persisted automatically.
        // No cartRepository.save(cart) is required here.

        // 18. Return the order response
        return OrderMapper.toResponse(savedOrder);
    }

    @Override
    public List<OrderResponseDto> getMyOrders() {

        Long currentUserId =
                currentUserService.getCurrentUser().getId();

        return orderRepository.findByUserId(currentUserId)
                .stream()
                .map(OrderMapper::toResponse)
                .toList();
    }

    @Override
    public OrderResponseDto getOrderById(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order Not Found!")
                );

        Long currentUserId =
                currentUserService.getCurrentUser().getId();

        if (order.getUser() == null
                || !order.getUser().getId().equals(currentUserId)) {
            throw new ResourceNotFoundException("Order Not Found!");
        }

        return OrderMapper.toResponse(order);
    }

    @Override
    public OrderResponseDto getOrderByUserId(Long userId) {

        Order order = orderRepository.findOrderByUserId(userId);

        if (order == null) {
            throw new ResourceNotFoundException("Order Not Found!");
        }

        return OrderMapper.toResponse(order);
    }

    @Override
    public List<OrderResponseDto> getAllOrder() {

        return orderRepository.findAll()
                .stream()
                .map(OrderMapper::toResponse)
                .toList();
    }

    @Override
    public OrderResponseDto updateOrder(
            Long id,
            OrderRequestDto dto) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order Not Found!")
                );

        Long currentUserId =
                currentUserService.getCurrentUser().getId();

        if (order.getUser() == null
                || !order.getUser().getId().equals(currentUserId)) {
            throw new ResourceNotFoundException("Order Not Found!");
        }

        order.setShippingAddress(dto.getShippingAddress());

        Order savedOrder = orderRepository.save(order);

        return OrderMapper.toResponse(savedOrder);
    }

    @Override
    public void deleteOrder(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order Not Found!")
                );

        Long currentUserId =
                currentUserService.getCurrentUser().getId();

        if (order.getUser() == null
                || !order.getUser().getId().equals(currentUserId)) {
            throw new ResourceNotFoundException("Order Not Found!");
        }

        orderRepository.delete(order);
    }

    @Override
    public OrderResponseDto updateOrderStatus(
            Long id,
            OrderStatus status) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order Not Found!")
                );

        if (!isValidStatusTransition(order.getStatus(), status)) {
            throw new RuntimeException(
                    "Invalid order status transition"
            );
        }

        order.setStatus(status);

        Order updatedOrder = orderRepository.save(order);

        return OrderMapper.toResponse(updatedOrder);
    }

    private boolean isValidStatusTransition(
            OrderStatus currentStatus,
            OrderStatus status) {

        return switch (currentStatus) {

            case PENDING ->
                    status == OrderStatus.CONFIRMED
                            || status == OrderStatus.CANCELED;

            case CONFIRMED ->
                    status == OrderStatus.PAID
                            || status == OrderStatus.CANCELED;

            case PAID ->
                    status == OrderStatus.PROCESSING;

            case PROCESSING ->
                    status == OrderStatus.SHIPPED;

            case SHIPPED ->
                    status == OrderStatus.DELIVERED;

            case DELIVERED, CANCELED ->
                    false;
        };
    }
}