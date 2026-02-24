#!/bin/bash
echo "Running database migration..."
psql -U postgres -d aoapro -f migrations/001-create-patients-table.sql

if [ $? -eq 0 ]; then
    echo "Migration completed successfully!"
else
    echo "Migration failed. Please check the error above."
    exit 1
fi
