@echo off
echo Running database migration...
psql -U postgres -d aoapro -f migrations/001-create-patients-table.sql
if %errorlevel% equ 0 (
    echo Migration completed successfully!
) else (
    echo Migration failed. Please check the error above.
    pause
)
