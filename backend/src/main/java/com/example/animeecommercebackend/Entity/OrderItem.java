
package com.example.animeecommercebackend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_item")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least one")
    @Column(nullable = false)
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    @DecimalMin(
            value = "0.00",
            message = "Unit price cannot be negative"
    )
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @NotNull(message = "Subtotal is required")
    @DecimalMin(
            value = "0.00",
            message = "Subtotal cannot be negative"
    )
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subTotal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;
}
