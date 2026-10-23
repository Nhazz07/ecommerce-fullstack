package com.example.animeecommercebackend.Event;

import com.example.animeecommercebackend.Client.TelegramClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCreateEventListener {
    private final TelegramClient telegramClient;
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleOrderCreated(OrderCreateEvent event) {

        String message = """
                 ANTEIKU — NEW ORDER

                 Order: #%s
                 Date: %s
                 Status: %s

                 Customer: %s
                 Phone: %s
                 Email: %s

                 Delivery Address:
                %s

                -----------------
                 Subtotal: $%s
                 Discount: $%s
                 Shipping: $%s
                 TOTAL: $%s
                -----------------
                """.formatted(
                event.orderNumber(),
                event.orderDate(),
                event.status(),
                event.customerName(),
                event.customerPhone(),
                event.customerEmail(),
                event.shippingAddress(),
                event.subTotal(),
                event.discountAmount(),
                event.shippingFee(),
                event.totalAmount()
        );

        try {
            telegramClient.sendMessage(message);
            log.info(
                    "Telegram order notification sent for order #{}",
                    event.orderNumber()
            );
        } catch (Exception exception) {
            // Notification failure must not undo a committed order.
            log.error(
                    "Failed to send Telegram notification for order #{}",
                    event.orderNumber(),
                    exception
            );
        }
    }
}
