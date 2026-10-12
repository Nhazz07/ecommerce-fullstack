
package com.example.animeecommercebackend.Entity;

import com.example.animeecommercebackend.Entity.Enums.ReturnStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "returns",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_returns_return_number",
                        columnNames = "return_number"
                )
        }
)
public class Return {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Return number is required")
    @Size(max = 100)
    @Column(nullable = false, unique = true, length = 100)
    private String returnNumber;

    @NotBlank(message = "Return reason is required")
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String reason;

    @NotNull(message = "Return status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReturnStatus status;

    @NotNull(message = "Requested date is required")
    @Column(nullable = false)
    private LocalDateTime requestedAt;

    private LocalDateTime processedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refund_id", unique = true)
    private Refund refund;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
