package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Dto.Request.OrderRequestDto;
import com.example.animeecommercebackend.Dto.Response.OrderResponseDto;
import com.example.animeecommercebackend.Entity.Order;
import com.example.animeecommercebackend.Entity.OrderItem;
import com.example.animeecommercebackend.Entity.ProductVariant;
import com.example.animeecommercebackend.Entity.User;
import com.example.animeecommercebackend.Entity.Enums.OrderStatus;
import com.example.animeecommercebackend.Entity.Enums.ProductStatus;
import com.example.animeecommercebackend.Exception.BusinessConflictException;
import com.example.animeecommercebackend.Exception.ResourceNotFoundException;
import com.example.animeecommercebackend.Mapper.OrderMapper;
import com.example.animeecommercebackend.Repository.CartRepository;
import com.example.animeecommercebackend.Repository.OrderRepository;
import com.example.animeecommercebackend.Service.CouponService;
import com.example.animeecommercebackend.Service.CurrentUserService;
import com.example.animeecommercebackend.Service.InventoryService;
import com.example.animeecommercebackend.Service.OrderService;
import com.example.animeecommercebackend.Service.PromotionService;
import com.example.animeecommercebackend.Service.ShipmentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import com.example.animeecommercebackend.Event.OrderCreateEvent;
import com.example.animeecommercebackend.Dto.Request.OrderItemRequestDto;
import com.example.animeecommercebackend.Repository.ProductVariantRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CurrentUserService currentUserService;
    private final InventoryService inventoryService;
    private final PromotionService promotionService;
    private final CouponService couponService;
    private final ShipmentService shipmentService;
    private final ApplicationEventPublisher eventPublisher;
    private final ProductVariantRepository productVariantRepository;


    @Override
    @Transactional
    public OrderResponseDto createOrder(OrderRequestDto dto) {

        // 1. Get authenticated user
        User user = currentUserService.getCurrentUser();

        // 2. Create order
        Order order = new Order();

        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderNumber(
                (int) (Math.random() * 90000000) + 10000000
        );
        order.setOrderDate(LocalDateTime.now());
        order.setShippingAddress(dto.getShippingAddress());

        BigDecimal subTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        // 3. Build order items from frontend request
        for (OrderItemRequestDto itemDto : dto.getOrderItems()) {

            ProductVariant variant = productVariantRepository
                    .findById(itemDto.getProductVariantId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Product Variant Not Found!"
                            )
                    );

            int quantity = itemDto.getQuantity();

            if (variant.getProduct() == null
                    || variant.getProduct().getStatus() != ProductStatus.ACTIVE) {

                throw new BusinessConflictException(
                        "Product variant " + variant.getId()
                                + " is not available for purchase."
                );
            }

            if (quantity <= 0) {
                throw new IllegalArgumentException(
                        "Quantity must be greater than zero!"
                );
            }

            // 4. Get authoritative database price
            BigDecimal unitPrice = variant.getPrice();

            if (unitPrice == null) {
                throw new IllegalArgumentException(
                        "Product variant price cannot be null!"
                );
            }

            // 5. Calculate promotion discount
            BigDecimal promotionDiscount =
                    promotionService.calculateDiscount(
                            variant.getProduct().getId(),
                            unitPrice
                    );

            if (promotionDiscount == null
                    || promotionDiscount.compareTo(BigDecimal.ZERO) < 0) {
                promotionDiscount = BigDecimal.ZERO;
            }

            if (promotionDiscount.compareTo(unitPrice) > 0) {
                promotionDiscount = unitPrice;
            }

            BigDecimal finalUnitPrice =
                    unitPrice.subtract(promotionDiscount);

            // 6. Calculate item subtotal
            BigDecimal itemSubtotal =
                    finalUnitPrice.multiply(
                            BigDecimal.valueOf(quantity)
                    );

            // 7. Create order item
            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setProductVariant(variant);
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(finalUnitPrice);
            orderItem.setSubTotal(itemSubtotal);

            orderItems.add(orderItem);

            subTotal = subTotal.add(itemSubtotal);
        }

        // 8. Attach order items
        order.setOrderItems(orderItems);
        order.setSubTotal(subTotal);

        // 9. Calculate coupon discount
        BigDecimal couponDiscount = BigDecimal.ZERO;

        if (dto.getCouponId() != null) {

            couponDiscount = couponService.calculateDiscount(
                    dto.getCouponId(),
                    subTotal
            );

            if (couponDiscount == null
                    || couponDiscount.compareTo(BigDecimal.ZERO) < 0) {
                couponDiscount = BigDecimal.ZERO;
            }
        }

        if (couponDiscount.compareTo(subTotal) > 0) {
            couponDiscount = subTotal;
        }

        order.setDiscountAmount(couponDiscount);

        // 10. Calculate shipping
        BigDecimal shippingFee =
                shipmentService.calculateShipmentFee(subTotal);

        if (shippingFee == null) {
            shippingFee = BigDecimal.ZERO;
        }

        order.setShippingFee(shippingFee);

        // 11. Calculate final amount
        BigDecimal totalAmount = subTotal
                .subtract(couponDiscount)
                .add(shippingFee);

        order.setTotalAmount(totalAmount);

        // 12. Save order
        Order savedOrder = orderRepository.save(order);

        // 13. Reserve inventory
        inventoryService.reserveOrderStock(savedOrder);

        orderRepository.save(savedOrder);

        // 14. Clear existing database cart if one exists
        cartRepository.findByUserId(user.getId())
                .ifPresent(cart -> cart.getCartItems().clear());

        // 15. Publish order event
        eventPublisher.publishEvent(
                new OrderCreateEvent(
                        savedOrder.getOrderNumber(),
                        savedOrder.getOrderDate(),
                        user.getFirstName() + " " + user.getLastName(),
                        user.getPhoneNumber(),
                        user.getEmail(),
                        savedOrder.getShippingAddress(),
                        savedOrder.getSubTotal(),
                        savedOrder.getDiscountAmount(),
                        savedOrder.getShippingFee(),
                        savedOrder.getTotalAmount(),
                        savedOrder.getStatus().name()
                )
        );

        // 16. Return response
        return OrderMapper.toResponse(savedOrder);
    }



    @Override
    @Transactional
    public List<OrderResponseDto> getMyOrders() {

        Long currentUserId =
                currentUserService
                        .getCurrentUser()
                        .getId();

        return orderRepository
                .findByUserId(currentUserId)
                .stream()
                .map(OrderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponseDto getOrderById(Long id) {

        Order order =
                orderRepository.findWithOrderItemsById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order Not Found!"
                                )
                        );

        Long currentUserId =
                currentUserService
                        .getCurrentUser()
                        .getId();

        if (order.getUser() == null
                || !order.getUser()
                .getId()
                .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Order Not Found!"
            );
        }

        return OrderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponseDto getOrderByUserId(Long userId) {

        Order order =
                orderRepository.findOrderByUserId(
                        userId
                );

        if (order == null) {
            throw new ResourceNotFoundException(
                    "Order Not Found!"
            );
        }

        return OrderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public List<OrderResponseDto> getAllOrder() {

        return orderRepository.findAll()
                .stream()
                .map(OrderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponseDto updateOrder(
            Long id,
            OrderRequestDto dto
    ) {

        Order order =
                orderRepository.findWithOrderItemsById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order Not Found!"
                                )
                        );

        Long currentUserId =
                currentUserService
                        .getCurrentUser()
                        .getId();

        if (order.getUser() == null
                || !order.getUser()
                .getId()
                .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Order Not Found!"
            );
        }

        order.setShippingAddress(
                dto.getShippingAddress()
        );

        Order savedOrder =
                orderRepository.save(order);

        return OrderMapper.toResponse(savedOrder);
    }

    @Override
    public void deleteOrder(Long id) {

        Order order =
                orderRepository.findWithOrderItemsById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order Not Found!"
                                )
                        );

        Long currentUserId =
                currentUserService
                        .getCurrentUser()
                        .getId();

        if (order.getUser() == null
                || !order.getUser()
                .getId()
                .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Order Not Found!"
            );
        }

        orderRepository.delete(order);
    }

    @Override
    @Transactional
    public OrderResponseDto updateOrderStatus(
            Long id,
            OrderStatus status
    ) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order Not Found!"
                                )
                        );

        if (status == OrderStatus.PAID) {
            throw new BusinessConflictException(
                    "Orders can only become PAID after verified payment confirmation."
            );
        }

        if (!isValidStatusTransition(
                order.getStatus(),
                status
        )) {
            throw new RuntimeException(
                    "Invalid order status transition"
            );
        }

        if (status == OrderStatus.CANCELED) {
            if (order.isInventoryCommitted()) {
                inventoryService.restockOrderStock(order);
            } else {
                inventoryService.releaseOrderStock(order);
            }
        }

        order.setStatus(status);

        Order updatedOrder =
                orderRepository.save(order);

        return OrderMapper.toResponse(updatedOrder);
    }

    private boolean isValidStatusTransition(
            OrderStatus currentStatus,
            OrderStatus status
    ) {

        return switch (currentStatus) {

            case PENDING ->
                    status == OrderStatus.CONFIRMED
                            || status == OrderStatus.CANCELED;

            case CONFIRMED ->
                    status == OrderStatus.PAID
                            || status == OrderStatus.CANCELED;

            case PAID ->
                    status == OrderStatus.PROCESSING
                            || status == OrderStatus.CANCELED;

            case PROCESSING ->
                    status == OrderStatus.SHIPPED;

            case SHIPPED ->
                    status == OrderStatus.DELIVERED;

            case DELIVERED, CANCELED ->
                    false;
        };
    }
}
