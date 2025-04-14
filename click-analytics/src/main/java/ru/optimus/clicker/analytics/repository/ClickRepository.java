package ru.optimus.clicker.analytics.repository;

import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;
import ru.optimus.clicker.analytics.model.GlobalClickModal;

import java.util.UUID;

@Repository
public interface ClickRepository extends CassandraRepository<GlobalClickModal, UUID> {
}
