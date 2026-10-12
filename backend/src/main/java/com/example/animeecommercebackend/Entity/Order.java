
package com.example.animeecommercebackend.Entity;

import com.example.animeecommercebackend.Entity.Enums.OrderStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "orders",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_orders_order_number",
                        columnNames = "order_number"
                )
        }
)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Order number is required")
    @Min(value = 1, message = "Order number must be greater than zero")
    @Column(name = "order_number", nullable = false, unique = true)
    private Integer orderNumber;

    @NotNull(message = "Order date is required")
    @Column(nullable = false)
    private LocalDateTime orderDate;

    @NotNull(message = "Order status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.00", message = "Total amount cannot be negative")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @NotNull(message = "Subtotal is required")
    @DecimalMin(value = "0.00", message = "Subtotal cannot be negative")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subTotal;

    @NotNull(message = "Shipping fee is required")
    @DecimalMin(value = "0.00", message = "Shipping fee cannot be negative")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal shippingFee;

    @NotNull(message = "Discount amount is required")
    @DecimalMin(value = "0.00", message = "Discount amount cannot be negative")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discountAmount;

    @NotBlank(message = "Shipping address is required")
    @Column(nullable = false, length = 1000)
    private String shippingAddress;

    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<OrderItem> orderItems = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @OneToOne(
            mappedBy = "order",
            fetch = FetchType.LAZY
    )
    private Payment payment;

    @OneToOne(
            mappedBy = "order",
            fetch = FetchType.LAZY
    )
    private Shipment shipment;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY)
    private List<Return> returns = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
