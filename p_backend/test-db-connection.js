// Simple script to test database connection and verify table structure
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'gautam@3210',
  database: process.env.DB_NAME || 'aoapro',
});

async function testConnection() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Connected to database successfully!\n');

    // Check if table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'patients'
    `);

    if (tableCheck.rows.length > 0) {
      console.log('✓ Patients table exists\n');
      // Get table structure
      console.log('Table structure:');
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'patients'
        ORDER BY ordinal_position
      `);

      columns.rows.forEach((col) => {
        console.log(
          `  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`,
        );
      });

      // Count records
      const count = await client.query('SELECT COUNT(*) FROM patients');
      console.log(
        `\n✓ Total records in patients table: ${count.rows[0].count}`,
      );

      if (parseInt(count.rows[0].count) === 0) {
        console.log(
          '\n⚠ Table is empty. This is normal - data will be inserted via API calls.',
        );
        console.log(
          '   Start the NestJS server and submit the patient form to insert data.\n',
        );
      } else {
        console.log('\n✓ Table contains data\n');
      }
    } else {
      console.log('✗ Patients table does NOT exist');
      console.log('\nTo create the table, run one of these:');
      console.log('  1. Start the NestJS server (TypeORM will auto-create it)');
      console.log(
        '  2. Run the migration script: migrations/run-migration.ps1',
      );
      console.log(
        '  3. Use pgAdmin to execute migrations/001-create-patients-table.sql\n',
      );
    }

    await client.end();
    console.log('✓ Connection closed');
  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error(`  ${error.message}\n`);
    if (error.code === 'ECONNREFUSED') {
      console.log('Troubleshooting:');
      console.log('  - Make sure PostgreSQL is running');
      console.log('  - Check if port 5432 is correct');
    } else if (error.code === '28P01') {
      console.log('Troubleshooting:');
      console.log('  - Check username and password in .env file');
      console.log('  - Default password: gautam@3210');
    } else if (error.code === '3D000') {
      console.log('Troubleshooting:');
      console.log('  - Database "aoapro" does not exist');
      console.log('  - Create it: CREATE DATABASE aoapro;');
    }
    process.exit(1);
  }
}

testConnection();
