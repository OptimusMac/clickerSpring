CREATE KEYSPACE IF NOT EXISTS clicker
WITH REPLICATION = {
  'class' : 'SimpleStrategy',
  'replication_factor' : 3
};

USE clicker;
