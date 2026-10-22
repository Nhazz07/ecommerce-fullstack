package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Entity.Order;
import com.example.animeecommercebackend.Entity.User;
import com.example.animeecommercebackend.Exception.ResourceNotFoundException;
import com.example.animeecommercebackend.Repository.OrderRepository;
import com.example.animeecommercebackend.Service.CurrentUserService;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderServiceImplTest {

    @Test
    void orderDetailDoesNotReturnAnotherCustomersOrder() {
        OrderRepository orderRepository = mock(OrderRepository.class);
        CurrentUserService currentUserService = mock(CurrentUserService.class);
        Order order = new Order();
        User owner = new User();
        owner.setId(200L);
        order.setUser(owner);
        when(orderRepository.findWithOrderItemsById(45L)).thenReturn(Optional.of(order));

        User currentUser = new User();
        currentUser.setId(100L);
        when(currentUserService.getCurrentUser()).thenReturn(currentUser);

        OrderServiceImpl service = new OrderServiceImpl(
                orderRepository,
                null,
                currentUserService,
                null,
                null,
                null,
                null
        );

        assertThrows(ResourceNotFoundException.class, () -> service.getOrderById(45L));
        verify(orderRepository).findWithOrderItemsById(45L);
    }
}
