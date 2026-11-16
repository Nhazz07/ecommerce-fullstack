package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Dto.Request.ProductRequestDto;
import com.example.animeecommercebackend.Dto.Response.ProductResponseDto;
import com.example.animeecommercebackend.Entity.Brand;
import com.example.animeecommercebackend.Entity.Category;
import com.example.animeecommercebackend.Entity.Inventory;
import com.example.animeecommercebackend.Entity.Product;
import com.example.animeecommercebackend.Entity.ProductVariant;
import com.example.animeecommercebackend.Entity.Series;
import com.example.animeecommercebackend.Entity.Enums.ProductStatus;
import com.example.animeecommercebackend.Repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProductServiceImplTest {

    private ProductRepository productRepository;
    private CategoryRepository categoryRepository;
    private BrandRepository brandRepository;
    private SeriesRepository seriesRepository;
    private ProductVariantRepository productVariantRepository;
    private InventoryRepository inventoryRepository;
    private CartItemRepository cartItemRepository;
    private ProductImageRepository productImageRepository;
    private ReviewRepository reviewRepository;
    private WishlistRepository wishlistRepository;

    private ProductServiceImpl productService;

    @BeforeEach
    void setUp() {
        productRepository = mock(ProductRepository.class);
        categoryRepository = mock(CategoryRepository.class);
        brandRepository = mock(BrandRepository.class);
        seriesRepository = mock(SeriesRepository.class);
        productVariantRepository = mock(ProductVariantRepository.class);
        inventoryRepository = mock(InventoryRepository.class);
        cartItemRepository = mock(CartItemRepository.class);
        productImageRepository = mock(ProductImageRepository.class);
        reviewRepository = mock(ReviewRepository.class);
        wishlistRepository = mock(WishlistRepository.class);

        productService = new ProductServiceImpl(
                productRepository,
                categoryRepository,
                brandRepository,
                seriesRepository,
                productVariantRepository,
                inventoryRepository,
                cartItemRepository,
                productImageRepository,
                reviewRepository,
                wishlistRepository
        );
    }

    @Test
    void createProductCreatesProductVariantAndInventory() {
        Category category = new Category();
        category.setId(1L);
        category.setName("Figures");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        Brand brand = new Brand();
        brand.setId(2L);
        brand.setName("Bandai");
        when(brandRepository.findById(2L)).thenReturn(Optional.of(brand));

        Series series = new Series();
        series.setId(3L);
        series.setName("Bleach");
        when(seriesRepository.findById(3L)).thenReturn(Optional.of(series));

        ProductRequestDto dto = new ProductRequestDto();
        dto.setProductName("Ichigo Kurosaki Figure");
        dto.setDescription("High quality figure");
        dto.setSku("BL-ICH-001");
        dto.setPrice(BigDecimal.valueOf(49.99));
        dto.setStatus(ProductStatus.ACTIVE);
        dto.setReleaseDate(LocalDateTime.now());
        dto.setCategoryId(1L);
        dto.setBrandId(2L);
        dto.setSeriesId(3L);
        dto.setInitialStock(25);
        dto.setReorderLevel(5);

        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(10L);
            return p;
        });

        when(productVariantRepository.existsBySku(anyString())).thenReturn(false);

        when(productVariantRepository.save(any(ProductVariant.class))).thenAnswer(invocation -> {
            ProductVariant v = invocation.getArgument(0);
            v.setId(100L);
            return v;
        });

        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> {
            Inventory inv = invocation.getArgument(0);
            inv.setId(500L);
            return inv;
        });

        ProductResponseDto response = productService.createProduct(dto);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Ichigo Kurosaki Figure", response.getName());

        // Verify Product Variant creation
        ArgumentCaptor<ProductVariant> variantCaptor = ArgumentCaptor.forClass(ProductVariant.class);
        verify(productVariantRepository).save(variantCaptor.capture());
        ProductVariant savedVariant = variantCaptor.getValue();
        assertEquals("BL-ICH-001", savedVariant.getSku());
        assertEquals("Standard", savedVariant.getName());
        assertEquals(BigDecimal.valueOf(49.99), savedVariant.getPrice());
        assertEquals(10L, savedVariant.getProduct().getId());

        // Verify Inventory creation
        ArgumentCaptor<Inventory> inventoryCaptor = ArgumentCaptor.forClass(Inventory.class);
        verify(inventoryRepository).save(inventoryCaptor.capture());
        Inventory savedInventory = inventoryCaptor.getValue();
        assertEquals(25, savedInventory.getQuantity());
        assertEquals(0, savedInventory.getReservedQuantity());
        assertEquals(25, savedInventory.getAvailableQuantity());
        assertEquals(5, savedInventory.getReOrderLevel());
        assertEquals(100L, savedInventory.getProductVariant().getId());

        // Verify response contains the variant and its inventory
        assertNotNull(response.getProductVariants());
        assertEquals(1, response.getProductVariants().size());
        assertEquals(100L, response.getProductVariants().get(0).getId());
        assertEquals(500L, response.getProductVariants().get(0).getInventoryId());
    }

    @Test
    void createProductWithCustomVariantDetailsAndDuplicateSku() {
        Category category = new Category();
        category.setId(1L);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        Brand brand = new Brand();
        brand.setId(2L);
        when(brandRepository.findById(2L)).thenReturn(Optional.of(brand));

        Series series = new Series();
        series.setId(3L);
        when(seriesRepository.findById(3L)).thenReturn(Optional.of(series));

        ProductRequestDto dto = new ProductRequestDto();
        dto.setProductName("Zoro Figure");
        dto.setDescription("Three sword style");
        dto.setSku("OP-ZOR-001");
        dto.setPrice(BigDecimal.valueOf(89.99));
        dto.setStatus(ProductStatus.ACTIVE);
        dto.setCategoryId(1L);
        dto.setBrandId(2L);
        dto.setSeriesId(3L);
        dto.setVariantSku("OP-ZOR-001");
        dto.setVariantName("Special Edition");
        dto.setVariantSize("1/8 Scale");
        dto.setVariantColor("Metallic");
        dto.setVariantPrice(BigDecimal.valueOf(99.99));
        dto.setInitialStock(50);
        dto.setReorderLevel(10);

        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(20L);
            return p;
        });

        // Simulate SKU already existing in product_variant
        when(productVariantRepository.existsBySku("OP-ZOR-001")).thenReturn(true);

        when(productVariantRepository.save(any(ProductVariant.class))).thenAnswer(invocation -> {
            ProductVariant v = invocation.getArgument(0);
            v.setId(200L);
            return v;
        });

        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> {
            Inventory inv = invocation.getArgument(0);
            inv.setId(600L);
            return inv;
        });

        ProductResponseDto response = productService.createProduct(dto);

        assertNotNull(response);

        ArgumentCaptor<ProductVariant> variantCaptor = ArgumentCaptor.forClass(ProductVariant.class);
        verify(productVariantRepository).save(variantCaptor.capture());
        ProductVariant savedVariant = variantCaptor.getValue();
        assertEquals("OP-ZOR-001-VAR-20", savedVariant.getSku());
        assertEquals("Special Edition", savedVariant.getName());
        assertEquals("1/8 Scale", savedVariant.getSize());
        assertEquals("Metallic", savedVariant.getColor());
        assertEquals(BigDecimal.valueOf(99.99), savedVariant.getPrice());

        ArgumentCaptor<Inventory> inventoryCaptor = ArgumentCaptor.forClass(Inventory.class);
        verify(inventoryRepository).save(inventoryCaptor.capture());
        Inventory savedInventory = inventoryCaptor.getValue();
        assertEquals(50, savedInventory.getQuantity());
        assertEquals(50, savedInventory.getAvailableQuantity());
        assertEquals(10, savedInventory.getReOrderLevel());
    }
}
