import { CosmosClient } from '@azure/cosmos';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  constructor() {
    if (!Database.instance) {
      const endpoint = process.env.COSMOS_ENDPOINT;
      const key = process.env.COSMOS_KEY;
      const databaseId = process.env.COSMOS_DATABASE;

      if (!endpoint || !key || !databaseId) {
        throw new Error('Missing required environment variables for Cosmos DB connection');
      }

      this.client = new CosmosClient({ endpoint, key });
      this.database = null;
      this.containers = {};
      Database.instance = this;
    }
    return Database.instance;
  }

  async init() {
    try {
      // Create database if it doesn't exist
      console.log('Initializing database and containers...');
      const { database } = await this.client.databases.createIfNotExists({
        id: process.env.COSMOS_DATABASE
      });
      this.database = database;

      // Create containers if they don't exist
      const containersToCreate = [
        { id: 'users', partitionKey: '/email' },
        { id: 'playlists', partitionKey: '/userId' },
        { id: 'songs', partitionKey: '/userId' }
      ];

      for (const containerDef of containersToCreate) {
        const { container } = await this.database.containers.createIfNotExists({
          id: containerDef.id,
          partitionKey: { paths: [containerDef.partitionKey] }
        });
        this.containers[containerDef.id] = container;
        console.log(`Container '${containerDef.id}' initialized`);
      }

      console.log('Database and containers initialized successfully');
      return this.containers;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  getContainers() {
    return this.containers;
  }

  listContainers() {
    console.log('Available containers:', Object.keys(this.containers));
  }
}

const database = new Database();

export default database;