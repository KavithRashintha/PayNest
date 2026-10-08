package com.paynest.financeservice.consumer;

import com.paynest.financeservice.event.TransactionCreatedEvent;
import com.paynest.financeservice.service.BudgetAlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TransactionEventConsumer {

    private final BudgetAlertService budgetAlertService;

    @KafkaListener(
            topics = "${paynest.kafka.topics.transaction-events:paynest.transaction.events}",
            groupId = "${spring.kafka.consumer.group-id:paynest-budget-alerts}"
    )
    public void consumeTransactionCreated(TransactionCreatedEvent event) {
        log.info("Received TransactionCreatedEvent from Kafka: transactionId={}, userId={}, amount={}, categoryId={}",
                event.getTransactionId(), event.getUserId(), event.getAmount(), event.getCategoryId());

        try {
            budgetAlertService.processTransactionForBudgetAlert(event);
        } catch (Exception e) {
            log.error("Error processing transaction event for budget alerts: {}", e.getMessage(), e);
        }
    }
}
