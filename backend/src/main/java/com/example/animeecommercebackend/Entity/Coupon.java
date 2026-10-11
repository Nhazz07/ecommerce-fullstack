
package com.example.animeecommercebackend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "coupons",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_coupon_code",
                        columnNames = "code"
                )
        }
)
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Coupon code is required")
    @Size(max = 50, message = "Coupon code must not exceed 50 characters")
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @NotBlank(message = "Discount type is required")
    @Size(max = 30)
    @Column(nullable = false, length = 30)
    private String discountType;

    @Size(max = 500)
    @Column(length = 500)
    private String description;

    @NotNull(message = "Discount value is required")
    @DecimalMin(
            value = "0.0",
            inclusive = false,
            message = "Discount value must be greater than zero"
    )
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @NotNull(message = "Minimum order amount is required")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Minimum order amount cannot be negative"
    )
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal minimumOrderAmount;

    @NotNull(message = "Start date is required")
    @Column(nullable = false)
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    @Column(nullable = false)
    private LocalDateTime endDate;

    @Min(value = 1, message = "Usage limit must be at least one")
    private Integer usageLimit;

    @NotNull
    @Min(value = 0, message = "Used count cannot be negative")
    @Column(nullable = false)
    private Integer usedCount = 0;

    @NotNull(message = "Active status is required")
    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "coupon", fetch = FetchType.LAZY)
    private Set<Order> orders = new HashSet<>();

    @OneToMany(mappedBy = "coupon", fetch = FetchType.LAZY)
    private List<User> users = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
