-- Find the actual constraint name for the unique constraint on equipment_assignments
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'equipment_assignments'::regclass
  AND contype = 'u';  -- unique constraints

-- Alternative: Show all constraints on the table
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'equipment_assignments'
  AND tc.constraint_type = 'UNIQUE';