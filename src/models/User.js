import database from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  static async create(userData) {
    const containers = database.getContainers();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = {
      id: Date.now().toString(),
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      createdAt: new Date().toISOString()
    };

    const { resource } = await containers.users.items.create(user);
    return resource;
  }

  static async findByEmail(email) {
    const containers = database.getContainers();
    const querySpec = {
      query: "SELECT * FROM c WHERE c.email = @email",
      parameters: [{ name: "@email", value: email }]
    };

    

    const { resources } = await containers.users.items.query(querySpec).fetchAll();
    return resources[0];
  }

  static async findById(userId) {
    console.log('Finding user with ID:', userId); // Log para depuração
    const containers = database.getContainers();
    
    try {
      // Primeiramente, buscar pelo userId e email (chave de partição)
      const querySpec = {
        query: "SELECT * FROM c WHERE c.id = @userId",
        parameters: [{ name: "@userId", value: userId }]
      };
      
      // A consulta deve buscar o usuário pelo `userId`
      const { resources } = await containers.users.items.query(querySpec).fetchAll();
      
      if (resources.length === 0) {
        throw new Error('User not found');
      }
  
      console.log('User found:', resources[0]); // Log para depuração
      return resources[0]; // Retornar o primeiro usuário encontrado
    } catch (err) {
      console.error('Error finding user by ID:', err);
      throw new Error('User not found');
    }
  }
  

static async update(userId, updatedData) {
  const containers = database.getContainers();
  
  try {
    // Consultar o usuário usando o `userId`
    const querySpec = {
      query: "SELECT * FROM c WHERE c.id = @userId",
      parameters: [{ name: "@userId", value: userId }]
    };
    
    // Buscar o usuário
    const { resources } = await containers.users.items.query(querySpec).fetchAll();
    
    if (resources.length === 0) {
      throw new Error('User not found');
    }
    
    const user = resources[0];

    // Log para depuração
    console.log('User before update:', user);
    // Atualizar os campos do usuário
    Object.assign(user, updatedData);

    // Log para depuração
    console.log('User after update:', user);

    // Atualizar o usuário no banco
    const { resource: updatedUser } = await containers.users.item(user.id, user.email).replace(user);
    return updatedUser;
  } catch (err) {
    console.error('Error updating user:', err);
    throw new Error('Failed to update user');
  }
}
  
  static async delete(userId) {
    const containers = database.getContainers();
    await containers.users.item(userId, userId).delete();
  }
  
}

export default User;