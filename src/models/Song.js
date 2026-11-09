import database from '../config/database.js';

class Song {
  static async create(songData) {
    const containers = database.getContainers();
    const song = {
      id: Date.now().toString(),
      title: songData.title,
      artist: songData.artist,
      duration: songData.duration,
      userId: songData.userId,
      createdAt: new Date().toISOString()
    };

    const { resource } = await containers.songs.items.create(song);
    return resource;
  }

  static async findById(id, userId) {
    const containers = database.getContainers();
    // A partition key do container songs é /userId (também garante que a música é do usuário)
    const { resource } = await containers.songs.item(id, userId).read();
    return resource;
  }
}

export default Song;