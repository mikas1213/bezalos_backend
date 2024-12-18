-- Visų DB dydis
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Lentelių dydžiai
SELECT 
    tablename, 
    pg_size_pretty(pg_total_relation_size(tablename::regclass))
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;