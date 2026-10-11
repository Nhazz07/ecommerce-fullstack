
package com.example.animeecommercebackend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
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
        name = "gift_card",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_gift_card_code",
                        columnNames = "code"
                )
        }
)
public class GiftCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Gift card code is required")
    @Size(max = 100)
    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @NotNull(message = "Initial balance is required")
    @DecimalMin(
            value = "0.01",
            message = "Initial balance must be greater than zero"
    )
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal initialBalance;

    @NotNull(message = "Remaining balance is required")
    @DecimalMin(
            value = "0.00",
            message = "Remaining balance cannot be negative"
    )
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal remainingBalance;

    @NotNull(message = "Expiration date is required")
    @Future(message = "Expiration date must be in the future")
    @Column(nullable = false)
    private LocalDateTime expirationDate;

    @NotBlank(message = "Gift card status is required")
    @Size(max = 30)
    @Column(nullable = false, length = 30)
    private String status;

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
