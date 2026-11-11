package com.example.animeecommercebackend.Service;

import com.example.animeecommercebackend.Dto.Request.ProductRequestDto;
import com.example.animeecommercebackend.Dto.Response.ProductResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    ProductResponseDto createProduct(ProductRequestDto dto);

    ProductResponseDto getProductById(Long id);

    ProductResponseDto getProductByIdForAdmin(Long id);

    Page<ProductResponseDto> getAllProduct(Pageable pageable);

    Page<ProductResponseDto> getAllProductsForAdmin(Pageable pageable);

    List<ProductResponseDto> getProductByCategoryId(Long categoryId);

    List<ProductResponseDto> getProductByBrandId(Long brandId);

    List<ProductResponseDto> getProductBySeriesId(Long seriesId);

    ProductResponseDto updateProduct(Long id, ProductRequestDto dto);

    void deleteProduct(Long id);

    ProductResponseDto archiveProduct(Long id);

    ProductResponseDto restoreProduct(Long id);
}
