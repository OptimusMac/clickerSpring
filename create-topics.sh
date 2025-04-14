#!/bin/bash

KAFKA_BOOTSTRAP_SERVER="kafka:9092"
TOPICS=(
  "clicker:10"
  "clicker-find:2"
  "clicker-replies:2"
)
REPLICATION_FACTOR=1

KAFKA_TOPICS="/opt/bitnami/kafka/bin/kafka-topics.sh"

wait_for_kafka() {
  echo "Waiting for Kafka to be ready..."
  while ! $KAFKA_TOPICS --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER" --list >/dev/null 2>&1; do
    sleep 1
  done
  echo "Kafka is ready!"
}

wait_for_kafka

for topic_info in "${TOPICS[@]}"; do
  IFS=':' read -r topic_name partitions <<< "$topic_info"

  # Remove any commas that might be present in the partitions value
  partitions=${partitions//,/}

  echo "Checking if topic $topic_name exists..."
  $KAFKA_TOPICS --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER" --list | grep -q "^${topic_name}$"

  if [ $? -ne 0 ]; then
    echo "Creating topic $topic_name with $partitions partitions"
    $KAFKA_TOPICS --create \
      --topic "$topic_name" \
      --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER" \
      --partitions "$partitions" \
      --replication-factor "$REPLICATION_FACTOR"
  else
    echo "Topic $topic_name already exists"
  fi
done