import express, { Request, Response } from 'express';
import pgp from 'pg-promise'

const app = express();
const port = 3000;

app.use(express.json());

app.get('/ongs', async (req: Request, res: Response) => {
    const connection = pgp()("postgres://sscpsql:P@ssword@ssr-solid.postgres.database.azure.com:5432/dogcare_db?rejectUnauthorized=false")
    const ongs = await connection.query(`
      SELECT
        o.id AS ong_id,
        o.name AS ong_name,
        o.description AS ong_description,
        o.location AS ong_location,
        COALESCE(json_agg(
          json_build_object(
            'id', a.id,
            'name', a.name,
            'species', a.species,
            'age', a.age
          )
        ) FILTER (WHERE a.id IS NOT NULL), '[]') AS animals
      FROM ongs o
      LEFT JOIN animals a ON o.id = a.ong_id
      GROUP BY o.id
    `);
    connection.$pool.end()
    res.json(ongs || []);
});

app.get('/ongs/:id', async (req: Request, res: Response) => {
    console.log(req.params.id)
    const connection = pgp()("postgres://sscpsql:P@ssword@ssr-solid.postgres.database.azure.com:5432/dogcare_db?rejectUnauthorized=false")
    const ongs = await connection.query(`
          SELECT
        o.id AS ong_id,
        o.name AS ong_name,
        o.description AS ong_description,
        o.location AS ong_location,
        COALESCE(json_agg(
          json_build_object(
            'id', a.id,
            'name', a.name,
            'species', a.species,
            'age', a.age
          )
        ) FILTER (WHERE a.id IS NOT NULL), '[]') AS animals
      FROM ongs o
      LEFT JOIN animals a ON o.id = a.ong_id
      WHERE o.id = $1
      GROUP BY o.id
    `, [req.params.id]);
    connection.$pool.end()
    res.json(ongs || []);
});


app.post('/ongs', async (req: Request, res: Response) => {
  const connection = pgp()("postgres://sscpsql:P@ssword@ssr-solid.postgres.database.azure.com:5432/dogcare_db?rejectUnauthorized=false")

    const existingOng = await connection.query('SELECT * FROM ongs WHERE name = $1', [req.body.name]);
    
    if (existingOng.length > 0) {
      connection.$pool.end()
      return res.status(400).json({ error: 'Já existe uma ONG com este nome.' });
    }

    const newOng = await connection.query(
      'INSERT INTO ongs(name, description, location) VALUES($1, $2, $3) RETURNING *',
      [req.body.name, req.body.description, req.body.location]
    );
    connection.$pool.end()
    res.status(201).json(newOng);
});


app.post('/animals', async (req: Request, res: Response) => {
  const connection = pgp()("postgres://sscpsql:P@ssword@ssr-solid.postgres.database.azure.com:5432/dogcare_db?rejectUnauthorized=false")

    const ong = await connection.query('SELECT * FROM ongs WHERE id = $1', [req.body.ong_id]);
    if (!ong) {
      connection.$pool.end()
      return res.status(404).json({ error: 'ONG não encontrada.' });
    }

    const newAnimal = await connection.query(
      'INSERT INTO animals(name, species, age, ong_id) VALUES($1, $2, $3, $4) RETURNING *',
      [req.body.name, req.body.species, req.body.age, req.body.ong_id]
    );

    connection.$pool.end()
    res.status(201).json(newAnimal);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
