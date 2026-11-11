package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Entity.Brand;
import com.example.animeecommercebackend.Exception.BusinessConflictException;
import com.example.animeecommercebackend.Repository.BrandRepository;
import com.example.animeecommercebackend.Repository.ProductRepository;
import com.example.animeecommercebackend.Service.CloudinaryService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class BrandServiceImplTest {
    @Test
    void refusesToDeleteBrandWithProducts() {
        BrandRepository brands = mock(BrandRepository.class);
        ProductRepository products = mock(ProductRepository.class);
        Brand brand = new Brand();
        when(brands.findById(1L)).thenReturn(java.util.Optional.of(brand));
        when(products.countByBrandId(1L)).thenReturn(4L);

        BrandServiceImpl service = new BrandServiceImpl(
                brands, products, mock(CloudinaryService.class)
        );

        assertThrows(BusinessConflictException.class, () -> service.deleteBrand(1L));
        verify(brands, never()).delete(any());
    }
}
