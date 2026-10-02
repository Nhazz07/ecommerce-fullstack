package com.example.animeecommercebackend.Controller;

import com.example.animeecommercebackend.Dto.ApiResponseDto;
import com.example.animeecommercebackend.Dto.Request.CouponRequestDto;
import com.example.animeecommercebackend.Dto.Response.CouponResponseDto;
import com.example.animeecommercebackend.Entity.Coupon;
import com.example.animeecommercebackend.Service.Impl.CouponServiceImpl;
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
@RequestMapping("/api/coupon")
@Validated
@RequiredArgsConstructor
public class CouponController {
    private final CouponServiceImpl couponServiceImpl;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<CouponResponseDto>> createCoupon(
            @RequestBody @Valid CouponRequestDto dto){
        CouponResponseDto coupon = couponServiceImpl.createCoupon(dto);

        ApiResponseDto<CouponResponseDto> response = new ApiResponseDto<>(
                true,
                "Coupon Created Successfully",
                coupon
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<CouponResponseDto>> getCouponById(
            @PathVariable @Positive Long id){
        CouponResponseDto coupon = couponServiceImpl.getCouponById(id);

        ApiResponseDto<CouponResponseDto> response = new ApiResponseDto<>(
                true,
                "Coupon Retrieved Successfully",
                coupon
        );
        return ResponseEntity.ok(response);
    }
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponseDto<CouponResponseDto>> getCouponByCode(
            @PathVariable String code){
        CouponResponseDto coupon = couponServiceImpl.getCouponByCode(code);

        ApiResponseDto<CouponResponseDto> response = new ApiResponseDto<>(
                true,
                "Coupon Retrieved Successfully",
                coupon
        );
        return ResponseEntity.ok(response);
    }
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<List<CouponResponseDto>>> getAllCoupon(){
        List<CouponResponseDto> coupons = couponServiceImpl.getAllCoupon();
        ApiResponseDto<List<CouponResponseDto>> response = new ApiResponseDto<>(
                true,
                "Coupon Retrieved Successfully!",
                coupons
        );
        return ResponseEntity.ok(response);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<CouponResponseDto>> updateCoupon(
            @PathVariable @Positive Long id,
            @RequestBody @Valid CouponRequestDto dto){
        CouponResponseDto coupon = couponServiceImpl.updateCoupon(id,dto);

        ApiResponseDto<CouponResponseDto> response = new ApiResponseDto<>(
                true,
                "Coupon Updated Successfully!",
                coupon
        );
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<Void>> deleteCoupon(
            @PathVariable @Positive Long id){
        couponServiceImpl.deleteCoupon(id);

        ApiResponseDto<Void> response = new ApiResponseDto<>(
                true,
                "Coupon Deleted Successfully!",
                null
        );
        return ResponseEntity.ok(response);
    }
}
