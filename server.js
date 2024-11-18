const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');


const app = express();

const port = 3000;

// Middleware para permitir que seu servidor entenda JSON
app.use(express.json());
app.use(cors()); // Isso permite requisições de qualquer origem

// Configuração da conexão com o banco de dados MySQL
const connection = mysql.createConnection({
    host: '127.0.0.1', // Substitua pelo host do seu MySQL
    user: 'root', // Substitua pelo seu usuário do MySQL
    password: 'yan040902', // Substitua pela senha do seu MySQL
    database: 'BD_Insulog' // Substitua pelo nome do seu banco de dados
});

// Conectando ao banco de dados
connection.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL!');

    // Inicializa o servidor após conectar ao banco de dados
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
});

// Rota básica
app.get('/', (req, res) => {
    res.send('Servidor Express está funcionando!');
});

app.get('/Periodo', (req, res) => {
    connection.query('SELECT * FROM Periodo', (err, results) => {
        if (err) {
            console.error('Erro ao executar consulta:', err); // Log para ajudar na depuração
            res.status(500).send('Erro ao buscar dados');
            return; // Retorna para garantir que a execução seja interrompida
        }

        // Verifique o conteúdo dos resultados antes de enviar a resposta
        if (!results || results.length === 0) {
            res.json({ message: 'Nenhum dado encontrado' });
        } else {
            res.json(results);
        }
    });
});

app.get('/Usuarios', (req, res) => {
    connection.query('SELECT * FROM Usuario', (err, results) => {
        if (err) {
            console.error('Erro ao executar consulta:', err); // Log para ajudar na depuração
            res.status(500).send('Erro ao buscar dados');
            return; // Retorna para garantir que a execução seja interrompida
        }

        // Verifique o conteúdo dos resultados antes de enviar a resposta
        if (!results || results.length === 0) {
            res.json({ message: 'Nenhum dado encontrado' });
        } else {
            res.json(results);
        }
    });
});

// Exemplo de rota para buscar dados
app.get('/RegistroGlicose', (req, res) => {
    connection.query('SELECT * FROM RegistroGlicose', (err, results) => {
        if (err) {
            console.error('Erro ao executar consulta:', err); // Log para ajudar na depuração
            res.status(500).send('Erro ao buscar dados');
            return; // Retorna para garantir que a execução seja interrompida
        }

        // Verifique o conteúdo dos resultados antes de enviar a resposta
        if (!results || results.length === 0) {
            res.json({ message: 'Nenhum dado encontrado' });
        } else {
            res.json(results);
        }
    });
});

app.post('/RegistrarGlicose', (req, res) => {
    const { id_usuario, nivel_glicose, data_hora, id_periodo, tipo_insulina, unidade_insulina } = req.body;

    // Insira a lógica de criação no banco de dados aqui
    const sql = 'INSERT INTO RegistroGlicose (id_usuario, nivel_glicose, data_hora, id_periodo, tipo_insulina, unidade_insulina) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [id_usuario, nivel_glicose, data_hora, id_periodo, tipo_insulina, unidade_insulina], (err, results) => {
        if (err) {
            console.error('Erro ao criar registro de glicose:', err);
            res.status(500).send('Erro ao criar registro de glicose');
            return;
        }
        res.status(201).json({ message: 'Registro criado com sucesso', id: results.insertId });
    });
});

app.delete('/ExcluirRegistroGlicose/:id', (req, res) => {
    const { id } = req.params;

    // Consulta ajustada para usar o campo correto `id_registro`
    const sql = 'DELETE FROM RegistroGlicose WHERE id_registro = ?';
    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Erro ao excluir registro de glicose:', err);
            res.status(500).send('Erro ao excluir registro de glicose');
            return;
        }

        if (results.affectedRows === 0) {
            res.status(404).json({ message: 'Registro não encontrado' });
        } else {
            res.json({ message: 'Registro excluído com sucesso' });
        }
    });
});

app.put('/EditarRegistroGlicose/:id', (req, res) => {
    const { id } = req.params;
    const { id_usuario, nivel_glicose, data_hora, id_periodo, tipo_insulina, unidade_insulina } = req.body;

    console.log('dados edicao: ', id, id_usuario, nivel_glicose, data_hora, id_periodo, tipo_insulina, unidade_insulina)

    // Consulta SQL para atualizar o registro
    const sql = `
        UPDATE registroglicose
        SET id_usuario = ?, nivel_glicose = ?, data_hora = ?, id_periodo = ?, tipo_insulina = ?, unidade_insulina = ?
        WHERE id_registro = ?`;

    connection.query(sql, [id_usuario, nivel_glicose, data_hora, id_periodo, tipo_insulina, unidade_insulina, id], (err, results) => {
        if (err) {
            console.error('Erro ao editar registro de glicose:', err);
            res.status(500).send('Erro ao editar registro de glicose');
            return;
        }

        if (results.affectedRows === 0) {
            res.status(404).json({ message: 'Registro não encontrado para edição' });
        } else {
            res.json({ message: 'Registro editado com sucesso' });
        }
    });
});

