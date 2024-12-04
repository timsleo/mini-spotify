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

  static async findById(id) {
    const containers = database.getContainers();
    const { resource } = await containers.songs.item(id).read();
    return resource;
  }
}

export default Song;