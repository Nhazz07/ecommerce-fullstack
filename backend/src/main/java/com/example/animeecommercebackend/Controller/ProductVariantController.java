package com.example.animeecommercebackend.Controller;

import com.example.animeecommercebackend.Dto.ApiResponseDto;
import com.example.animeecommercebackend.Dto.Request.ProductVariantRequestDto;
import com.example.animeecommercebackend.Dto.Response.ProductVariantResponseDto;
import com.example.animeecommercebackend.Service.Impl.ProductVariantServiceImpl;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productVariant")
@Validated
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantServiceImpl productVariantServiceImpl;

    // ADMIN: CREATE PRODUCT VARIANT

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<ProductVariantResponseDto>> createProductVariant(
            @RequestBody @Valid ProductVariantRequestDto dto) {

        ProductVariantResponseDto productVariant =
                productVariantServiceImpl.createProductVariant(dto);

        ApiResponseDto<ProductVariantResponseDto> response =
                new ApiResponseDto<>(
                        true,
                        "Product Variant Created Successfully",
                        productVariant
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // CUSTOMER / ADMIN: GET PRODUCT VARIANT BY ID

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<ProductVariantResponseDto>> getProductVariantById(
            @PathVariable @Positive Long id) {

        ProductVariantResponseDto productVariant =
                productVariantServiceImpl.getProductVariantById(id);

        ApiResponseDto<ProductVariantResponseDto> response =
                new ApiResponseDto<>(
                        true,
                        "Product Variant Retrieved Successfully",
                        productVariant
                );

        return ResponseEntity.ok(response);
    }

    // ADMIN: GET ALL PRODUCT VARIANTS

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<List<ProductVariantResponseDto>>> getAllProductVariant() {

        List<ProductVariantResponseDto> productVariants =
                productVariantServiceImpl.getAllProductVariant();

        ApiResponseDto<List<ProductVariantResponseDto>> response =
                new ApiResponseDto<>(
                        true,
                        "Product Variant Retrieved Successfully",
                        productVariants
                );

        return ResponseEntity.ok(response);
    }

    // PUBLIC: GET PRODUCT VARIANTS BY PRODUCT ID

    @GetMapping("/productId/{productId}")
    public ResponseEntity<ApiResponseDto<List<ProductVariantResponseDto>>> getProductVariantByProductid(
            @PathVariable @Positive Long productId) {

        List<ProductVariantResponseDto> productVariants =
                productVariantServiceImpl.getVariantByProductId(productId);

        ApiResponseDto<List<ProductVariantResponseDto>> response =
                new ApiResponseDto<>(
                        true,
                        "Product Variant Retrieved Successfully",
                        productVariants
                );

        return ResponseEntity.ok(response);
    }

    // ADMIN: UPDATE PRODUCT VARIANT

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<ProductVariantResponseDto>> updateProductVariant(
            @PathVariable @Positive Long id,
            @RequestBody @Valid ProductVariantRequestDto dto) {

        ProductVariantResponseDto productVariants =
                productVariantServiceImpl.updateProductVariant(id, dto);

        ApiResponseDto<ProductVariantResponseDto> response =
                new ApiResponseDto<>(
                        true,
                        "Product Variant Updated Successfully",
                        productVariants
                );

        return ResponseEntity.ok(response);
    }

    // ADMIN: DELETE PRODUCT VARIANT

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<Void>> deleteProductVariant(
            @PathVariable @Positive Long id) {

        productVariantServiceImpl.deleteProductVariant(id);

        ApiResponseDto<Void> response =
                new ApiResponseDto<>(
                        true,
                        "Product Variant Deleted Successfully",
                        null
                );

        return ResponseEntity.ok(response);
    }
}