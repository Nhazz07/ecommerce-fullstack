package com.example.animeecommercebackend.Mapper;

import com.example.animeecommercebackend.Dto.Request.ProductImageRequestDto;
import com.example.animeecommercebackend.Dto.Response.ProductImageResponseDto;
import com.example.animeecommercebackend.Entity.ProductImages;
import org.springframework.stereotype.Component;

@Component
public class ProductImagesMapper {

    public static ProductImages toEntity(ProductImageRequestDto dto
                                  ){
        ProductImages productImages = new ProductImages();

        productImages.setImageUrl(dto.getUrlImages());
        productImages.setAltText(dto.getAltText());
        productImages.setDisplayOrder(productImages.getDisplayOrder());


        return productImages;
    }

    public static ProductImageResponseDto toResponse(ProductImages productImages){
        ProductImageResponseDto dto = new ProductImageResponseDto();

        dto.setId(productImages.getId());
        dto.setImageUrl(productImages.getImageUrl());
        dto.setAltText(productImages.getAltText());
        dto.setDisplayOrder(productImages.getDisplayOrder());
        return dto;
    }
}

