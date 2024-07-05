import axios from'axios';
import { faker } from '@faker-js/faker';

const baseURL = 'http://localhost:3000';

describe('ONGs API', () => {
  it('should get all ONGs', async () => {
    const response = await axios.get(`${baseURL}/ongs`);
    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Array);
  });

  it('should get a specific ONG by ID', async () => {
    const ongId = 1; // Replace with an actual ONG ID in your database
    const response = await axios.get(`${baseURL}/ongs/${ongId}`);
    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data[0]).toHaveProperty('ong_id', ongId);
  });

  it('should create a new ONG', async () => {
    const newOng = {
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      location: faker.location.city()
    };

    const response = await axios.post(`${baseURL}/ongs`, newOng);
    expect(response.status).toBe(201);
    expect(response.data[0]).toHaveProperty('name', newOng.name);
  });

  it('should create a new animal for an ONG', async () => {
    const newAnimal = {
      name: faker.animal.dog(),
      species: 'Dog',
      age: faker.number.int({ min: 1, max: 10 }),
      ong_id: 1 // Replace with an actual ONG ID in your database
    };

    const response = await axios.post(`${baseURL}/animals`, newAnimal);
    expect(response.status).toBe(201);
    expect(response.data[0]).toHaveProperty('name', newAnimal.name);
  });
});
