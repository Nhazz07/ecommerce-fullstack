package com.example.animeecommercebackend.Dto.Response;

import com.example.animeecommercebackend.Entity.Enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDto {

    private Long id;

    private String name;

    private String description;

    private String sku;

    private BigDecimal price;

    private ProductStatus status;

    private LocalDateTime releaseDate;

    private Long categoryId;

    private String categoryName;

    private Long brandId;

    private String brandName;

    private Long seriesId;

    private String seriesName;

    private List<Long> productVariantIds;

    private List<ProductImageResponseDto> productImages;

    private List<Long> reviewId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}