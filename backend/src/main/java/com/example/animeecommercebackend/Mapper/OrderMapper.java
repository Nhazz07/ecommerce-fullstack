package com.example.animeecommercebackend.Mapper;

import com.example.animeecommercebackend.Dto.Request.OrderRequestDto;
import com.example.animeecommercebackend.Dto.Response.OrderItemResponseDto;
import com.example.animeecommercebackend.Dto.Response.OrderResponseDto;
import com.example.animeecommercebackend.Entity.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderMapper {

    public static Order toEntity(OrderRequestDto dto
                          ){
        Order order = new Order();

        order.setShippingAddress(dto.getShippingAddress());



        return order;
    }

    public static OrderResponseDto toResponse(Order order){
        OrderResponseDto dto = new OrderResponseDto();

        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus());

        dto.setTotalAmount(order.getTotalAmount());
        dto.setSubTotal(order.getSubTotal());
        dto.setShippingFee(order.getShippingFee());
        dto.setDiscountAmount(order.getDiscountAmount());

        dto.setShippingAddress(order.getShippingAddress());

        List<OrderItem> orderItems = order.getOrderItems() == null
                ? List.of()
                : order.getOrderItems();
        dto.setProductVariantIds(orderItems.stream()
                .filter(item -> item.getProductVariant() != null)
                .map(item -> item.getProductVariant().getId())
                .toList());
        dto.setOrderItems(orderItems.stream()
                .map(OrderMapper::toOrderItemResponse)
                .toList());

        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        if(order.getUser() != null){
            dto.setUserId((order.getUser().getId()));
        }
        if(order.getCoupon() != null){
           dto.setCouponId(order.getCoupon().getId());
        }
        if(order.getPayment() != null){
            dto.setPaymentId(order.getPayment().getId());
        }
        if(order.getShipment() != null){
            dto.setShipmentId(order.getShipment().getId());
        }
        if(order.getReturns() != null){
            dto.setReturnsId(order.getReturns().stream().map(Return::getId).toList());
        }else{
            dto.setReturnsId(List.of());
        }
        return dto;
    }

    private static OrderItemResponseDto toOrderItemResponse(OrderItem orderItem) {
        ProductVariant variant = orderItem.getProductVariant();
        Product product = variant == null ? null : variant.getProduct();
        String productImageUrl = product == null || product.getProductImages() == null
                ? null
                : product.getProductImages().stream()
                        .filter(image -> image.getImageUrl() != null && !image.getImageUrl().isBlank())
                        .map(ProductImages::getImageUrl)
                        .findFirst()
                        .orElse(null);

        return new OrderItemResponseDto(
                orderItem.getId(),
                product == null ? null : product.getProductName(),
                variant == null ? null : variant.getName(),
                variant == null ? null : variant.getSku(),
                orderItem.getQuantity(),
                orderItem.getUnitPrice(),
                orderItem.getSubTotal(),
                productImageUrl
        );
    }


}
