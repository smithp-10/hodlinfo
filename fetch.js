const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance for PostgreSQL
const pool = new Pool({
  user: 'postgres', // or the appropriate username
  host: 'localhost',
  database: 'hodlinfo',
  password: 'Smith@0410', // Updated password
  port: 5432,
});

// Function to fetch data from WazirX API and store it in PostgreSQL
async function fetchData() {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const data = response.data;

    console.log('API Response:', JSON.stringify(data, null, 2)); // Print the full response for inspection

    // Process and store data in PostgreSQL
    await storeData(data);
  } catch (error) {
    console.error('Error fetching data from WazirX API:', error);
  }
}

// Function to store data in PostgreSQL
async function storeData(data) {
  const client = await pool.connect();
  try {
    // Inspect the data structure
    console.log('Data Structure:', JSON.stringify(data, null, 2));

    if (!data || typeof data !== 'object') {
      console.error('Unexpected data format:', data);
      throw new Error('Invalid data format from API');
    }

    // Determine how to access tickers or equivalent data
    const tickers = data.tickers || data; // Adjust this if the structure is different

    if (!tickers || typeof tickers !== 'object') {
      console.error('Missing or invalid tickers property:', tickers);
      throw new Error('Invalid data format from API');
    }

    const insertQuery = `
      INSERT INTO cryptocurrencies (symbol, last, buy, sell, volume)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (symbol) DO UPDATE 
      SET last = EXCLUDED.last,
          buy = EXCLUDED.buy,
          sell = EXCLUDED.sell,
          volume = EXCLUDED.volume;
    `;

    // Example data processing
    for (const [symbol, ticker] of Object.entries(tickers)) {
      if (!ticker || !ticker.last || !ticker.buy || !ticker.sell || !ticker.volume) {
        console.error(`Missing data for symbol ${symbol}:`, ticker);
        continue; // Skip this entry if any required field is missing
      }

      await client.query(insertQuery, [
        symbol,
        ticker.last,
        ticker.buy,
        ticker.sell,
        ticker.volume,
      ]);
    }

    console.log('Data successfully stored in PostgreSQL');
  } catch (error) {
    console.error('Error storing data in PostgreSQL:', error);
  } finally {
    client.release();
  }
}

// Call fetchData to start the process
fetchData();
