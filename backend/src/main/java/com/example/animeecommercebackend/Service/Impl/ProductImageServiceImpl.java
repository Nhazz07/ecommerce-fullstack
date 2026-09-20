package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Dto.Response.CloudinaryUploadResponseDto;
import com.example.animeecommercebackend.Dto.Response.ProductImageResponseDto;
import com.example.animeecommercebackend.Entity.Product;
import com.example.animeecommercebackend.Entity.ProductImages;
import com.example.animeecommercebackend.Exception.ResourceNotFoundException;
import com.example.animeecommercebackend.Mapper.ProductImagesMapper;
import com.example.animeecommercebackend.Repository.ProductImageRepository;
import com.example.animeecommercebackend.Repository.ProductRepository;
import com.example.animeecommercebackend.Service.CloudinaryService;
import com.example.animeecommercebackend.Service.ProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public ProductImageResponseDto createProductImage(
            Long productId,
            MultipartFile file,
            String altText,
            Integer displayOrder
    ) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product Not Found!"
                        )
                );

        CloudinaryUploadResponseDto cloudinaryUploadResponseDto = cloudinaryService.uploadImage(file);

        ProductImages productImages = new ProductImages();

        productImages.setProduct(product);
        productImages.setImageUrl(cloudinaryUploadResponseDto.getImageUrl());
        productImages.setPublicId(cloudinaryUploadResponseDto.getPublicId());
        productImages.setAltText(altText);
        productImages.setDisplayOrder(displayOrder);

        ProductImages saved =
                productImageRepository.save(productImages);

        return ProductImagesMapper.toResponse(saved);
    }

    @Override
    public ProductImageResponseDto getProductImageById(Long id) {

        ProductImages productImages =
                productImageRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product Image Not Found!"
                                )
                        );

        return ProductImagesMapper.toResponse(productImages);
    }

    @Override
    public List<ProductImageResponseDto> getAllProductImages() {

        return productImageRepository.findAll()
                .stream()
                .map(ProductImagesMapper::toResponse)
                .toList();
    }

    @Override
    public List<ProductImageResponseDto> getImageByProductId(
            Long productId
    ) {

        List<ProductImages> productImages =
                productImageRepository.findByProductId(productId);

        if (productImages.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Product Images Not Found!"
            );
        }

        return productImages
                .stream()
                .map(ProductImagesMapper::toResponse)
                .toList();
    }

    @Override
    public ProductImageResponseDto updateProductImage(
            Long id,
            MultipartFile file,
            String altText,
            Integer displayOrder
    ) {

        ProductImages productImages =
                productImageRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product Image Not Found!"
                                )
                        );

        // Delete old image from Cloudinary
        if (productImages.getPublicId() != null) {
            cloudinaryService.deleteImage(
                    productImages.getPublicId()
            );
        }

        // Upload new image
        CloudinaryUploadResponseDto cloudinaryUploadResponseDto =
                cloudinaryService.uploadImage(file);

        productImages.setImageUrl(
                cloudinaryUploadResponseDto.getImageUrl()
        );

        productImages.setPublicId(
                cloudinaryUploadResponseDto.getPublicId()
        );

        productImages.setAltText(altText);

        productImages.setDisplayOrder(displayOrder);

        ProductImages updated =
                productImageRepository.save(productImages);

        return ProductImagesMapper.toResponse(updated);
    }

    @Override
    public void deleteProductImage(Long id) {

        ProductImages productImages =
                productImageRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product Image Not Found!"
                                )
                        );

        if (productImages.getPublicId() != null) {
            cloudinaryService.deleteImage(
                    productImages.getPublicId()
            );
        }

        productImageRepository.delete(productImages);
    }
}