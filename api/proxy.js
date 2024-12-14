import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

// URL do Google Apps Script
const googleAppsScriptURL = 'https://script.google.com/macros/s/AKfycbwhE5uAVLNMoR7gTO-rqidvSYFVquP6gJifZ_rnOuNGz5YOlXX8_wzp7pX-DagLsezv/exec';

// Rota Proxy
app.post('/api/proxy', async (req, res) => {
    try {
        const response = await fetch(googleAppsScriptURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Erro no Proxy:', error);
        res.status(500).json({ error: 'Erro ao conectar ao Google Apps Script' });
    }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
