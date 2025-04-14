package ru.optimus.clicker.analytics.model;


import com.datastax.oss.driver.api.core.uuid.Uuids;
import lombok.Data;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

import java.io.Serializable;
import java.math.BigInteger;
import java.util.UUID;

@Data
@Table("clicks")

public class GlobalClickModal implements Serializable {

    private static final long serialVersionUID = 1L;


    @PrimaryKey
    private UUID id = Uuids.timeBased();

    @Column("value")
    private BigInteger value = BigInteger.ZERO;

    public void insert(BigInteger bigInteger) {
        this.value = this.value.add(bigInteger);
    }

}
