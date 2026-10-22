package com.example.animeecommercebackend.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponseDto {

    private Long id;
    private String productName;
    private String variantName;
    private String variantSku;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subTotal;
    private String productImageUrl;
}
