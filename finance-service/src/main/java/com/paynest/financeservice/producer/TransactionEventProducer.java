package com.paynest.financeservice.producer;

import com.paynest.financeservice.event.TransactionCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TransactionEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${paynest.kafka.topics.transaction-events:paynest.transaction.events}")
    private String transactionEventsTopic;

    public void publishTransactionCreated(TransactionCreatedEvent event) {
        if (event == null) {
            return;
        }

        String key = String.valueOf(event.getUserId());
        log.info("Publishing TransactionCreatedEvent to Kafka topic '{}': transactionId={}, userId={}, amount={}",
                transactionEventsTopic, event.getTransactionId(), event.getUserId(), event.getAmount());

        try {
            kafkaTemplate.send(transactionEventsTopic, key, event)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("Failed to publish transaction event for transactionId={}: {}",
                                    event.getTransactionId(), ex.getMessage(), ex);
                        } else {
                            log.debug("Successfully published transaction event to partition {} at offset {}",
                                    result.getRecordMetadata().partition(),
                                    result.getRecordMetadata().offset());
                        }
                    });
        } catch (Exception e) {
            log.error("Exception occurred while sending event to Kafka: {}", e.getMessage(), e);
        }
    }
}
