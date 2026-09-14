package com.example.animeecommercebackend.Controller;

import com.example.animeecommercebackend.Dto.ApiResponseDto;
import com.example.animeecommercebackend.Dto.Request.CartRequestDto;
import com.example.animeecommercebackend.Dto.Response.CartResponseDto;
import com.example.animeecommercebackend.Service.Impl.CartServiceImpl;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@Validated
@RequiredArgsConstructor
public class CartController {

    private final CartServiceImpl cartServiceImpl;


    @PostMapping
    public ResponseEntity<ApiResponseDto<CartResponseDto>> createCart(
            @RequestBody CartRequestDto dto,
            @RequestHeader(value = "X-Cart-Token", required = false)
            String cartToken
    ) {
        CartResponseDto response =
                cartServiceImpl.createCart(dto, cartToken);

        return ResponseEntity.ok(
                new ApiResponseDto<>(
                        true,
                        "Cart Created Successfully!",
                        response
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDto<CartResponseDto>> getCartById(
            @PathVariable @Positive Long id,
            @RequestHeader(
                    value = "X-Cart-Token",
                    required = false
            ) String cartToken){

        CartResponseDto cart =
                cartServiceImpl.getCartById(id, cartToken);

        ApiResponseDto<CartResponseDto> response = new ApiResponseDto<>(
                true,
                "Cart Retrieved Successfully",
                cart
        );

        return ResponseEntity.ok(response);
    }


    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<List<CartResponseDto>>> getAllCart(){

        List<CartResponseDto> cart = cartServiceImpl.getAllCart();

        ApiResponseDto<List<CartResponseDto>> response = new ApiResponseDto<>(
                true,
                "Cart Retrieved Successfully",
                cart
        );

        return ResponseEntity.ok(response);
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDto<CartResponseDto>> updateCartById(
            @PathVariable @Positive Long id,
            @RequestBody @Valid CartRequestDto dto,
            @RequestHeader(
                    value = "X-Cart-Token",
                    required = false
            ) String cartToken){

        CartResponseDto cart =
                cartServiceImpl.updateCart(id, dto, cartToken);

        ApiResponseDto<CartResponseDto> response = new ApiResponseDto<>(
                true,
                "Cart Updated Successfully",
                cart
        );

        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteCart(
            @PathVariable @Positive Long id,
            @RequestHeader(
                    value = "X-Cart-Token",
                    required = false
            ) String cartToken){

        cartServiceImpl.deleteCart(id, cartToken);

        ApiResponseDto<Void> response = new ApiResponseDto<>(
                true,
                "Cart Deleted Successfully!",
                null
        );

        return ResponseEntity.ok(response);
    }


    @PostMapping("/{cartId}/products/{productVariantId}")
    public ResponseEntity<ApiResponseDto<CartResponseDto>> addProductVariant(
            @PathVariable @Positive Long cartId,
            @PathVariable @Positive Long productVariantId,
            @RequestHeader(
                    value = "X-Cart-Token",
                    required = false
            ) String cartToken){

        CartResponseDto cart =
                cartServiceImpl.addProductVariant(
                        cartId,
                        productVariantId,
                        cartToken
                );

        ApiResponseDto<CartResponseDto> response = new ApiResponseDto<>(
                true,
                "Product Variant Added to Cart Successfully!",
                cart
        );

        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{cartId}/products/{productVariantId}")
    public ResponseEntity<ApiResponseDto<CartResponseDto>> removeProductVariant(
            @PathVariable @Positive Long cartId,
            @PathVariable @Positive Long productVariantId,
            @RequestHeader(
                    value = "X-Cart-Token",
                    required = false
            ) String cartToken){

        CartResponseDto cart =
                cartServiceImpl.removeProductVariant(
                        cartId,
                        productVariantId,
                        cartToken
                );

        ApiResponseDto<CartResponseDto> response = new ApiResponseDto<>(
                true,
                "Product Variant Removed Successfully!",
                cart
        );

        return ResponseEntity.ok(response);
    }
}