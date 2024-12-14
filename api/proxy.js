const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Permite requisições de qualquer origem
app.use(cors()); 

// Permite o envio de JSON no corpo das requisições
app.use(express.json());

// Rota para redirecionar as requisições ao Google Apps Script
app.post('/api/proxy', async (req, res) => {
    try {
        const googleAppsScriptURL = 'https://script.google.com/macros/s/AKfycbzc9vpDooWkd_0NNKn8hdaKcFV-nEW-eqmpej3UemA/dev';
        
        // Faz a requisição ao Google Apps Script
        const response = await fetch(googleAppsScriptURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body), // Repassa o corpo da requisição
        });

        const data = await response.json(); // Captura a resposta do Google Apps Script

        // Retorna a resposta para o cliente
        res.setHeader('Access-Control-Allow-Origin', '*'); // Cabeçalho CORS
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); // Métodos permitidos
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Cabeçalhos permitidos

        res.json(data); // Envia os dados de volta
    } catch (error) {
        console.error('Erro no Proxy:', error);
        res.status(500).json({ error: 'Erro ao conectar ao Google Apps Script' });
    }
});

// Exporta o app (necessário para o Vercel)
module.exports = app;
