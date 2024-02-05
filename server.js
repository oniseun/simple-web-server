const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const redis = require('redis');
const { MongoClient } = require('mongodb');
const { Kafka } = require('kafkajs');
require('dotenv').config();

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const date = new Date();
    const responseData = {
        nodeVersion: process.version,
        timeOfDay: date.toLocaleTimeString(),
        message: 'Welcome, If you are seeing this, it means the api is working',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ipAddress: req.ip
    };
    res.json(responseData);
});

app.get('/google', async (req, res) => {
    try {
        await axios.get('https://www.google.com');
        res.json({ internet: 'OK', message: 'Google.com call successfull, which means there is internet connection ' });
    } catch (error) {
        res.status(500).json({ error: error.message, internet: 'NONE' });
    }
});

app.get('/env', (req, res) => {
    res.json({ environmentVariables: process.env });
});

app.get('/postgresql', async (req, res) => {
    const pgPool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT,
    });
  
    try {
      await pgPool.connect();
      res.json({ message: 'PostgreSQL connection succeed' });
    } catch (error) {
      res.status(500).json({ message: 'PostgreSQL connection failed', error: error.message });
    } finally {
      await pgPool.end();
    }
  });
  
  app.get('/redis', async (req, res) => {
    const { REDIS_USERNAME, REDIS_PASSWORD, REDIS_HOST, REDIS_PORT} = process.env
    const url = `redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`;
     console.log({url })
    const redisClient = redis.createClient({
        url, 
    });
    
    try {
        
        await redisClient.connect();
        // Returns PONG
        console.log(`Response from PING command: ${await redisClient.ping()}`);
        return res.json({ message: 'Redis connection succeed' });
    } catch (e) {
        console.error(`GET command failed: ${e.message}`);
        return res.status(500).json({ message: 'Redis connection failed', error: e.message });
    } finally {
        console.log(`Quit Redis Client`);
        await redisClient.quit(); 
    }
    
  });
  
  app.get('/mongodb', async (req, res) => {
    const mongoClient = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
  
    try {
      await mongoClient.connect();
      res.json({ message: 'MongoDB connection succeed' });
    } catch (error) {
      res.status(500).json({ message: 'MongoDB connection failed', error: error.message });
    } finally {
      await mongoClient.close();
    }
  });

app.get('/kafka', async (req, res) => {

  const kafka = new Kafka({
    clientId: 'test-app',
    brokers: [process.env.KAFKA_BROKER], // Update with your Kafka broker address
    ssl: true, // Set to true if SSL is enabled
    sasl: {
      mechanism: 'plain', // SASL mechanism (e.g., plain)
      username: process.env.KAFKA_USERNAME, // Kafka username
      password: process.env.KAFKA_PASSWORD // Kafka password
    }
  });
  // Create an admin client to test the connection
  const admin = kafka.admin();
  
  const testConnection = async () => {
    try {
      // Connect to the Kafka cluster
      await admin.connect();
      console.log('Connection to Kafka cluster successful');
      res.json({ message: 'Kafka connection succeed' });
    } catch (error) {
      console.error('Error connecting to Kafka cluster:', error);
      res.status(500).json({ message: 'Kafka connection failed', error: error.message });
    } finally {
      // Disconnect from the Kafka cluster
      await admin.disconnect();
    }
  };
  
  // Test the connection
  await testConnection();
});
  
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
