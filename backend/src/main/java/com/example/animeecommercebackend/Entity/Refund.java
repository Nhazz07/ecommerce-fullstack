
package com.example.animeecommercebackend.Entity;

import com.example.animeecommercebackend.Entity.Enums.RefundStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
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

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "refunds",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_refunds_refund_number",
                        columnNames = "refund_number"
                )
        }
)
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Refund number is required")
    @Size(max = 100)
    @Column(nullable = false, unique = true, length = 100)
    private String refundNumber;

    @NotNull(message = "Refund amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Refund amount must be greater than zero"
    )
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @NotBlank(message = "Refund reason is required")
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String reason;

    @NotNull(message = "Refund status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RefundStatus status;

    private LocalDateTime refundAt;

    @OneToOne(
            mappedBy = "refund",
            fetch = FetchType.LAZY
    )
    private Return aReturn;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
