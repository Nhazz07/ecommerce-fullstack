package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Entity.Category;
import com.example.animeecommercebackend.Exception.BusinessConflictException;
import com.example.animeecommercebackend.Repository.CategoryRepository;
import com.example.animeecommercebackend.Repository.ProductRepository;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class CategoryServiceImplTest {
    @Test
    void refusesToDeleteCategoryWithProducts() {
        CategoryRepository categories = mock(CategoryRepository.class);
        ProductRepository products = mock(ProductRepository.class);
        Category category = new Category();
        when(categories.findById(1L)).thenReturn(java.util.Optional.of(category));
        when(products.countByCategoryId(1L)).thenReturn(4L);

        CategoryServiceImpl service = new CategoryServiceImpl(categories, products);

        assertThrows(BusinessConflictException.class, () -> service.deleteCategory(1L));
        verify(categories, never()).delete(any());
    }

    @Test
    void deletesCategoryWithoutProducts() {
        CategoryRepository categories = mock(CategoryRepository.class);
        ProductRepository products = mock(ProductRepository.class);
        Category category = new Category();
        when(categories.findById(1L)).thenReturn(java.util.Optional.of(category));
        when(products.countByCategoryId(1L)).thenReturn(0L);

        new CategoryServiceImpl(categories, products).deleteCategory(1L);

        verify(categories).delete(category);
    }
}
