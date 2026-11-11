package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Dto.Request.BrandRequestDto;
import com.example.animeecommercebackend.Dto.Response.BrandResponseDto;
import com.example.animeecommercebackend.Dto.Response.CloudinaryUploadResponseDto;
import com.example.animeecommercebackend.Entity.Brand;
import com.example.animeecommercebackend.Entity.Product;
import com.example.animeecommercebackend.Exception.ResourceNotFoundException;
import com.example.animeecommercebackend.Exception.BusinessConflictException;
import com.example.animeecommercebackend.Mapper.BrandMapper;
import com.example.animeecommercebackend.Repository.BrandRepository;
import com.example.animeecommercebackend.Repository.ProductRepository;
import com.example.animeecommercebackend.Service.BrandService;
import com.example.animeecommercebackend.Service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public BrandResponseDto createBrand(
            MultipartFile file,
            String name,
            String description) {


        CloudinaryUploadResponseDto cloudinaryUploadResponseDto = cloudinaryService.uploadImage(file);

        Brand brand = new Brand();
        brand.setLogoUrl(cloudinaryUploadResponseDto.getImageUrl());
        brand.setPublicId(cloudinaryUploadResponseDto.getPublicId());
        brand.setName(name);
        brand.setDescription(description);

        Brand saved = brandRepository.save(brand);
        return BrandMapper.toResponse(saved);
    }

    @Override
    public BrandResponseDto getBrandById(Long id) {
        Brand brand = brandRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Brand Not Found!"));
        return BrandMapper.toResponse(brand);
    }

    @Override
    public List<BrandResponseDto> getAllBrand() {
        return brandRepository.findAll().stream().map(BrandMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public BrandResponseDto updateBrand(
            Long id,
            MultipartFile file,
            String name,
            String description
            ) {
        Brand brand = brandRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Brand Not Found!"));

        // delete old brand image
        if(brand.getPublicId() != null){
            cloudinaryService.deleteImage(
                    brand.getPublicId()
            );
        }
        CloudinaryUploadResponseDto cloudinaryUploadResponseDto = cloudinaryService.uploadImage(file);
        brand.setLogoUrl(cloudinaryUploadResponseDto.getImageUrl());
        brand.setPublicId(cloudinaryUploadResponseDto.getPublicId());
        brand.setName(name);
        brand.setDescription(description);

        Brand updated = brandRepository.save(brand);
        return BrandMapper.toResponse(updated);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteBrand(Long id) {
       Brand brand = brandRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Brand Not Found!!"));
       long productCount = productRepository.countByBrandId(id);
       if (productCount > 0) {
           throw new BusinessConflictException(
                   "Cannot delete brand because " + productCount + " products are associated with it."
           );
       }
       brandRepository.delete(brand);
    }
}
