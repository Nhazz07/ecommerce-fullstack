package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Dto.Request.CategoryRequestDto;
import com.example.animeecommercebackend.Dto.Response.CategoryResponseDto;
import com.example.animeecommercebackend.Entity.Category;
import com.example.animeecommercebackend.Entity.Product;
import com.example.animeecommercebackend.Exception.ResourceNotFoundException;
import com.example.animeecommercebackend.Exception.BusinessConflictException;
import com.example.animeecommercebackend.Mapper.CategoryMapper;
import com.example.animeecommercebackend.Repository.CategoryRepository;
import com.example.animeecommercebackend.Repository.ProductRepository;
import com.example.animeecommercebackend.Service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    @Override
    public CategoryResponseDto createCategory(
            CategoryRequestDto dto) {

        Category category = CategoryMapper.toEntity(dto);

        category.setImageUrl(dto.getImageUrl());
        category.setName(dto.getName());

        Category saved = categoryRepository.save(category);
        return CategoryMapper.toResponse(saved);
    }

    @Override
    public CategoryResponseDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Category Not Found!!"));
        return CategoryMapper.toResponse(category);
    }

    @Override
    public List<CategoryResponseDto> getAllCategory() {
        List<Category> categories = categoryRepository.findAll();
        if(categories.isEmpty()){
            throw new ResourceNotFoundException("There's no category!!");
        }
        return categories.stream().map(CategoryMapper::toResponse).toList();
    }

    @Override
    public CategoryResponseDto updateCategory(Long id, CategoryRequestDto dto) {

        Category category = categoryRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Category Not Found!!"));

        category.setName(dto.getName());
        category.setImageUrl(dto.getImageUrl());
        category.setDescription(dto.getDescription());

        Category updated = categoryRepository.save(category);
        return CategoryMapper.toResponse(updated);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Category Id Not Found!"));
        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new BusinessConflictException(
                    "Cannot delete category because " + productCount
                            + " products are associated with it. Reassign the products before deleting this category."
            );
        }
        categoryRepository.delete(category);
    }
}
