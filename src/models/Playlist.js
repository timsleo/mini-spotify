import database from '../config/database.js';

class Playlist {
  static async create(playlistData) {
    const containers = database.getContainers();
    const playlist = {
      id: Date.now().toString(),
      name: playlistData.name,
      userId: playlistData.userId,
      songs: [],
      createdAt: new Date().toISOString()
    };

    const { resource } = await containers.playlists.items.create(playlist);
    return resource;
  }

  static async addSong(playlistId, songId, userId) {
    const containers = database.getContainers();
    try {
  
      console.log('Testing playlists container...');
      const { resources } = await containers.playlists.items.query('SELECT * FROM c').fetchAll();
      console.log('Playlist found:', resources);

      console.log('Attempting to add song:', songId, 'to playlist:', playlistId);
      console.log('User ID (partition key):', userId);

    // Buscar a playlist no banco
    const { resource: playlist } = await containers.playlists.item(playlistId, userId).read();
    console.log('Playlist found:', playlist);

      // Verificar se a playlist foi encontrada
      if (!playlist) {
        console.error('Playlist not found for ID:', playlistId);
        throw new Error('Playlist not found');
      }
  
    // Adicionar a música à playlist
    if (!playlist.songs) playlist.songs = []; // Garante que o campo songs é um array
    playlist.songs.push(songId);
  
      // Atualizar a playlist no banco
      const { resource } = await containers.playlists.item(playlistId, userId).replace(playlist);
      console.log('Playlist updated:', resource); 
      return resource;
    } catch (err) {
      console.error('Error adding song to playlist:', err);
      throw new Error('Failed to add song to playlist');
    }
  }

  static async getUserPlaylists(userId) {
    const containers = database.getContainers();
    const querySpec = {
      query: "SELECT * FROM c WHERE c.userId = @userId",
      parameters: [{ name: "@userId", value: userId }]
    };

    const { resources } = await containers.playlists.items.query(querySpec).fetchAll();
    return resources;
  }

  static async update(playlistId, data, userId) {
    const containers = database.getContainers();
    const { resource: playlist } = await containers.playlists.item(playlistId, userId).read();
  
    if (!playlist) {
      throw new Error('Playlist not found');
    }
  
    // Atualizar os campos
    if (data.name) playlist.name = data.name;
  
    const { resource: updatedPlaylist } = await containers.playlists.item(playlistId, userId).replace(playlist);
    return updatedPlaylist;
  }
  
  static async delete(playlistId, userId) {
    const containers = database.getContainers();
    await containers.playlists.item(playlistId, userId).delete();
  }  
}

export default Playlist;