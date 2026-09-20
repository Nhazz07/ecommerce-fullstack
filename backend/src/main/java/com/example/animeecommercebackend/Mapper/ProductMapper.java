package com.example.animeecommercebackend.Mapper;

import com.example.animeecommercebackend.Dto.Request.ProductRequestDto;
import com.example.animeecommercebackend.Dto.Response.ProductImageResponseDto;
import com.example.animeecommercebackend.Dto.Response.ProductResponseDto;
import com.example.animeecommercebackend.Entity.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductMapper {

    public static Product toEntity(ProductRequestDto dto) {

        Product product = new Product();

        product.setProductName(dto.getProductName());
        product.setDescription(dto.getDescription());
        product.setSku(dto.getSku());
        product.setPrice(dto.getPrice());
        product.setStatus(dto.getStatus());
        product.setReleaseDate(dto.getReleaseDate());

        return product;
    }

    public static ProductResponseDto toResponse(Product product) {

        ProductResponseDto dto = new ProductResponseDto();

        dto.setId(product.getId());
        dto.setName(product.getProductName());
        dto.setDescription(product.getDescription());
        dto.setSku(product.getSku());
        dto.setPrice(product.getPrice());
        dto.setStatus(product.getStatus());
        dto.setReleaseDate(product.getReleaseDate());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());

        // Category
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }

        // Brand
        if (product.getBrand() != null) {
            dto.setBrandId(product.getBrand().getId());
            dto.setBrandName(product.getBrand().getName());
        }

        // Series
        if (product.getSeries() != null) {
            dto.setSeriesId(product.getSeries().getId());
            dto.setSeriesName(product.getSeries().getName());
        }

        // Product Variants
        if (product.getProductVariants() != null) {
            dto.setProductVariantIds(
                    product.getProductVariants()
                            .stream()
                            .map(ProductVariant::getId)
                            .toList()
            );
        } else {
            dto.setProductVariantIds(List.of());
        }

        // Product Images
        if (product.getProductImages() != null) {
            dto.setProductImages(
                    product.getProductImages()
                            .stream()
                            .map(ProductMapper::toImageResponse)
                            .toList()
            );
        } else {
            dto.setProductImages(List.of());
        }

        // Reviews
        if (product.getReviews() != null) {
            dto.setReviewId(
                    product.getReviews()
                            .stream()
                            .map(Review::getId)
                            .toList()
            );
        } else {
            dto.setReviewId(List.of());
        }

        return dto;
    }

    private static ProductImageResponseDto toImageResponse(
            ProductImages image
    ) {

        ProductImageResponseDto dto =
                new ProductImageResponseDto();

        dto.setId(image.getId());
        dto.setImageUrl(image.getImageUrl());
        dto.setAltText(image.getAltText());
        dto.setDisplayOrder(image.getDisplayOrder());

        return dto;
    }
}