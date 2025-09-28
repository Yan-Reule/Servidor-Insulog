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
  password: 'insulog12345', // Substitua pela senha do seu MySQL
  database: 'db_insulog' // Substitua pelo nome do seu banco de dados
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



// logo depois de app.use(cors());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} — body:`, req.body);
  next();
});

// Rota básica
app.get('/', (req, res) => {
  res.send('Servidor Express está funcionando!');
});

//==========================================================================================================
//ROTAS PROEX 28/09/2025
//==========================================================================================================


// Pacientes com maior número de registros
app.get('/Consultas/pacientes/maiorNumeroRegistros', (req, res) => {
  const sql = `
    SELECT p.nome_completo, COUNT(rg.id_registro) AS total_registros
    FROM paciente p
    JOIN registroglicose rg ON p.id_usuario = rg.id_usuario
    GROUP BY p.nome_completo
    ORDER BY total_registros DESC
    LIMIT 5
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar pacientes com maior número de registros:', err);
      return res.status(500).json({ message: 'Erro interno' });
    }
    res.json(results);
  });
});

// Média de glicose por paciente
app.get('/Consultas/pacientes/mediaGlicose', (req, res) => {
  const sql = `
    SELECT p.nome_completo, AVG(rg.nivel_glicose) AS media_glicose
    FROM paciente p
    JOIN registroglicose rg ON p.id_usuario = rg.id_usuario
    GROUP BY p.nome_completo
    ORDER BY media_glicose DESC
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar média de glicose por paciente:', err);
      return res.status(500).json({ message: 'Erro interno' });
    }
    res.json(results);
  });
});

// Pacientes com maior número de aplicações de insulina
app.get('/Consultas/pacientes/maiorNumeroInsulina', (req, res) => {
  const sql = `
    SELECT p.nome_completo, COUNT(rg.unidade_insulina) AS total_insulina
    FROM paciente p
    JOIN registroglicose rg ON p.id_usuario = rg.id_usuario
    GROUP BY p.nome_completo
    ORDER BY total_insulina DESC
    LIMIT 5
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar pacientes com maior número de aplicações de insulina:', err);
      return res.status(500).json({ message: 'Erro interno' });
    }
    res.json(results);
  });
});

// 5 maiores registros de glicose no último mês
app.get('/Consultas/glicose/maioresRegistros', (req, res) => {
  const sql = `
    SELECT rg.nivel_glicose, rg.data_hora, p.nome_completo
    FROM registroglicose rg
    JOIN paciente p ON rg.id_usuario = p.id_usuario
    WHERE rg.data_hora >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    ORDER BY rg.nivel_glicose DESC
    LIMIT 5
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar maiores registros de glicose:', err);
      return res.status(500).json({ message: 'Erro interno' });
    }
    res.json(results);
  });
});

// Média de glicose por faixa etária
app.get('/Consultas/glicose/mediaPorFaixaEtaria', (req, res) => {
  const sql = `
    SELECT 
      CASE 
        WHEN TIMESTAMPDIFF(YEAR, CURDATE(), CURDATE()) BETWEEN 0 AND 18 THEN '0-18 anos'
        WHEN TIMESTAMPDIFF(YEAR, CURDATE(), CURDATE()) BETWEEN 19 AND 35 THEN '19-35 anos'
        WHEN TIMESTAMPDIFF(YEAR, CURDATE(), CURDATE()) BETWEEN 36 AND 60 THEN '36-60 anos'
        ELSE '60+ anos'
      END AS faixa_etaria,
      AVG(rg.nivel_glicose) AS media_glicose
    FROM registroglicose rg
    GROUP BY faixa_etaria
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar média de glicose por faixa etária:', err);
      return res.status(500).json({ message: 'Erro interno' });
    }
    res.json(results);
  });
});

// Pacientes com glicose acima do recomendado
app.get('/Consultas/glicose/acimaRecomendado', (req, res) => {
  const sql = `
    SELECT p.nome_completo, rg.nivel_glicose, rg.data_hora
    FROM registroglicose rg
    JOIN paciente p ON rg.id_usuario = p.id_usuario
    WHERE rg.nivel_glicose > 140
    ORDER BY rg.nivel_glicose DESC
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar pacientes com glicose acima do recomendado:', err);
      return res.status(500).json({ message: 'Erro interno' });
    }
    res.json(results);
  });
});

// Médico com maior número de pacientes
app.get('/Consultas/medico/maiorNumeroPacientes', (req, res) => {
  const sql = `
    SELECT m.nome, COUNT(p.id_usuario) AS total_pacientes
    FROM medico m
    JOIN paciente p ON m.id_usuario = p.id_medico
    GROUP BY m.nome
    ORDER BY total_pacientes DESC
    LIMIT 1
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar médico com maior número de pacientes:', err);
      return res.status(500).json({ message: 'Erro interno' });
    }
    res.json(results);
  });
});


//==========================================================================================================
//==========================================================================================================

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

// Rota de login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
  }

  // Busca o médico pelo e-mail
  const sql = 'SELECT id_usuario, nome, senha FROM medico WHERE email = ?';
  connection.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Erro no banco ao buscar médico:', err);
      return res.status(500).json({ message: 'Erro interno' });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const { id_usuario, nome, senha: senhaSalva } = results[0];

    // Comparação direta da senha
    const senhaValida = senha === senhaSalva;

    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Se tudo OK, devolve o ID e o nome
    res.json({ id: id_usuario, nome });
  });
});

// GET /RegistroGlicose/usuario/:id_usuario
app.get('/RegistroGlicose/usuario/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;
  const sql = `
    SELECT 
      rg.data_hora                        AS dataHora,
      DATE_FORMAT(rg.data_hora, '%H:%i') AS hora,
      rg.nivel_glicose                    AS glicose,
      rg.unidade_insulina                 AS insulina,
      per.descricao                   AS periodo
    FROM registroglicose AS rg
    JOIN Periodo         AS per
      ON rg.id_periodo = per.id_periodo
    WHERE rg.id_usuario = ?
    ORDER BY rg.data_hora DESC
    LIMIT 20
  `;
  connection.query(sql, [id_usuario], (err, results) => {
    if (err) {
      console.error('Erro ao buscar medições:', err);
      return res.status(500).json({ message: 'Erro interno' });
    }
    // results será [] se não houver linhas, e JSON sai corretamente
    res.json(results);
  });
});

// GET /Paciente/:id_usuario
app.get('/Paciente/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;
  const sql = `
    SELECT 
      p.id_usuario,
      p.id_medico,
      p.email,
      p.nome_completo,
      p.cpf,
      p.celular,
      p.plano_saude,
      p.numero_prontuario
    FROM paciente p
    WHERE p.id_usuario = ?
  `;
  connection.query(sql, [id_usuario], (err, results) => {
    if (err) {
      console.error('Erro ao buscar paciente:', err);
      return res.status(500).json({ message: 'Erro interno' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }
    res.json(results[0]);
  });
});

// Busca todos os pacientes de um médico
app.get('/Paciente/medico/:id_medico', (req, res) => {
  const { id_medico } = req.params;

  const sql = `
    SELECT 
      u.id_usuario   AS id,
      p.nome_completo,
      p.email,
      p.celular,
      p.plano_saude,
      p.numero_prontuario
    FROM paciente p
    JOIN usuario u ON u.id_usuario = p.id_usuario
    WHERE p.id_medico = ?
  `;
  connection.query(sql, [id_medico], (err, results) => {
    if (err) {
      console.error('Erro ao buscar pacientes:', err);
      return res.status(500).json({ message: 'Erro interno' });
    }
    res.json(results);
  });
});

// Rota para cadastrar um paciente
app.post('/Paciente', (req, res) => {
  const {
    nome_completo,
    email,
    cpf,
    celular,
    senha,
    plano_saude,
    numero_prontuario,
    id_medico
  } = req.body;

  if (!nome_completo || !email || !cpf || !senha || !id_medico) {
    return res.status(400).json({
      message: 'Faltam dados obrigatórios (nome, email, cpf, senha e id_medico).'
    });
  }

  try {
    const senhaSalva = senha; // Usa a senha como texto puro

    const sqlUser = `
      INSERT INTO usuario
        (nome, email, senha, tipo_usuario)
      VALUES
        (?, ?, ?, ?)
    `;
    connection.query(
      sqlUser,
      [nome_completo, email, senhaSalva, 'paciente'],
      (errUser, userResult) => {
        if (errUser) {
          console.error('Erro ao criar usuário:', errUser);
          return res.status(500).json({ message: 'Erro ao criar usuário' });
        }
        const newUserId = userResult.insertId;

        const sqlPac = `
          INSERT INTO paciente
            (id_usuario, id_medico, email, nome_completo,
             cpf, celular, senha, plano_saude, numero_prontuario)
          VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        connection.query(
          sqlPac,
          [
            newUserId,
            id_medico,
            email,
            nome_completo,
            cpf,
            celular || null,
            senhaSalva,
            plano_saude || null,
            numero_prontuario || null
          ],
          errPac => {
            if (errPac) {
              console.error('Erro ao criar paciente:', errPac);
              return res.status(500).json({ message: 'Erro ao criar paciente' });
            }
            res.status(201).json({
              message: 'Paciente cadastrado com sucesso',
              id: newUserId
            });
          }
        );
      }
    );
  } catch (e) {
    console.error('Erro interno do servidor:', e);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para cadastrar um médico
app.post('/Medico', (req, res) => {
  const { nome, email, senha, crm, tipo_usuario } = req.body;
  if (!nome || !email || !senha || !crm) {
    return res.status(400).json({ message: 'Faltam dados obrigatórios' });
  }

  try {
    const senhaSalva = senha; // Usa a senha como texto puro

    const sqlUser = `
      INSERT INTO usuario (nome, email, senha, tipo_usuario)
      VALUES (?, ?, ?, ?)
    `;
    connection.query(
      sqlUser,
      [nome, email, senhaSalva, tipo_usuario],
      (errUser, userResult) => {
        if (errUser) {
          console.error('Erro ao criar usuário:', errUser);
          return res.status(500).json({ message: 'Erro ao criar usuário' });
        }
        const newUserId = userResult.insertId;

        const sqlMed = `
          INSERT INTO medico (id_usuario, nome, email, senha, crm)
          VALUES (?, ?, ?, ?, ?)
        `;
        connection.query(
          sqlMed,
          [newUserId, nome, email, senhaSalva, crm],
          errMed => {
            if (errMed) {
              console.error('Erro ao criar médico:', errMed);
              return res.status(500).json({ message: 'Erro ao criar médico' });
            }
            res.status(201).json({
              message: 'Médico cadastrado com sucesso',
              id: newUserId
            });
          }
        );
      }
    );
  } catch (e) {
    console.error('Erro interno do servidor:', e);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.post('/RegistrarGlicose', (req, res) => {
  const {
    id_usuario,
    nivel_glicose,
    data_hora,
    id_periodo,
    tipo_insulina,
    unidade_insulina,
    // campo extra que existe na tabela
    registroglicosecol
  } = req.body;

  // validação simples
  if (
    id_usuario == null ||
    nivel_glicose == null ||
    !data_hora ||
    id_periodo == null ||
    !tipo_insulina ||
    !unidade_insulina
  ) {
    return res
      .status(400)
      .json({ message: 'Faltam campos obrigatórios no corpo da requisição.' });
  }

  const sql = `
    INSERT INTO registroglicose
      (id_usuario,
       nivel_glicose,
       data_hora,
       id_periodo,
       tipo_insulina,
       registroglicosecol,
       unidade_insulina)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [
      id_usuario,
      nivel_glicose,
      data_hora,
      id_periodo,
      tipo_insulina,
      registroglicosecol ?? null,  // envia null se não vier
      unidade_insulina
    ],
    (err, result) => {
      if (err) {
        console.error('Erro ao criar registro de glicose:', err);
        return res
          .status(500)
          .json({ message: 'Erro interno ao criar registro de glicose.' });
      }
      res
        .status(201)
        .json({ id: result.insertId, message: 'Registro criado com sucesso.' });
    }
  );
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

