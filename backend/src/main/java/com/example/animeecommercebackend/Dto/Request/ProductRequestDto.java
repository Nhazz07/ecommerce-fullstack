package com.example.animeecommercebackend.Dto.Request;

import com.example.animeecommercebackend.Entity.Enums.ProductStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequestDto {

    @NotBlank(message = "Product name is required")
    private String productName;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.00", message = "Price cannot be negative")
    private BigDecimal price;

    @NotNull(message = "Product status is required")
    private ProductStatus status;

    private LocalDateTime releaseDate;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Brand ID is required")
    private Long brandId;

    @NotNull(message = "Series ID is required")
    private Long seriesId;

    private String variantSku;

    private String variantName;

    @DecimalMin(value = "0.00", message = "Variant price cannot be negative")
    private BigDecimal variantPrice;

    private String variantSize;

    private String variantColor;

    @Min(value = 0, message = "Initial stock cannot be negative")
    private Integer initialStock;

    @Min(value = 0, message = "Reorder level cannot be negative")
    private Integer reorderLevel;
}