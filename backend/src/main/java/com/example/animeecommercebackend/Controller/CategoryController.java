package com.example.animeecommercebackend.Controller;

import com.example.animeecommercebackend.Dto.ApiResponseDto;
import com.example.animeecommercebackend.Dto.Request.CategoryRequestDto;
import com.example.animeecommercebackend.Dto.Response.CategoryResponseDto;
import com.example.animeecommercebackend.Service.Impl.CategoryServiceImpl;
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
@RequestMapping("/api/category")
@Validated
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryServiceImpl categoryServiceImpl;


    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<CategoryResponseDto>> createCategory(
            @RequestBody @Valid CategoryRequestDto dto){

        CategoryResponseDto category =
                categoryServiceImpl.createCategory(dto);

        ApiResponseDto<CategoryResponseDto> response =
                new ApiResponseDto<>(
                        true,
                        "Category Created Successfully!",
                        category
                );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    @GetMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<CategoryResponseDto>> getCategoryById(
            @PathVariable @Positive Long id){

        CategoryResponseDto category =
                categoryServiceImpl.getCategoryById(id);

        ApiResponseDto<CategoryResponseDto> response =
                new ApiResponseDto<>(
                        true,
                        "Category Retrieved Successfully!",
                        category
                );

        return ResponseEntity.ok(response);
    }


    @GetMapping
    public ResponseEntity<ApiResponseDto<List<CategoryResponseDto>>> getAllCategory(){

        List<CategoryResponseDto> categories =
                categoryServiceImpl.getAllCategory();

        ApiResponseDto<List<CategoryResponseDto>> response =
                new ApiResponseDto<>(
                        true,
                        "Category Retrieved Successfully",
                        categories
                );

        return ResponseEntity.ok(response);
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<CategoryResponseDto>> updateCategory(
            @PathVariable @Positive Long id,
            @RequestBody @Valid CategoryRequestDto dto){

        CategoryResponseDto category =
                categoryServiceImpl.updateCategory(id, dto);

        ApiResponseDto<CategoryResponseDto> response =
                new ApiResponseDto<>(
                        true,
                        "Category Updated Successfully!",
                        category
                );

        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<Void>> deleteCategory(
            @PathVariable @Positive Long id){

        categoryServiceImpl.deleteCategory(id);

        ApiResponseDto<Void> response =
                new ApiResponseDto<>(
                        true,
                        "Category Deleted Successfully",
                        null
                );

        return ResponseEntity.ok(response);
    }
}