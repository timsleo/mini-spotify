import { CosmosClient } from '@azure/cosmos';
import dotenv from 'dotenv';

dotenv.config();

class CosmosConnection {
  constructor() {
    if (!CosmosConnection.instance) {
      this.client = new CosmosClient({
        endpoint: process.env.COSMOS_ENDPOINT,
        key: process.env.COSMOS_KEY
      });
      
      this.database = this.client.database(process.env.COSMOS_DATABASE);
      this.containers = {
        users: this.database.container('users'),
        playlists: this.database.container('playlists'),
        songs: this.database.container('songs')
      };
      
      CosmosConnection.instance = this;
    }
    
    return CosmosConnection.instance;
  }
}

export default new CosmosConnection().containers;