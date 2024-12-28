import fetch from 'node-fetch';

export default async function handler(req, res) {
    // Lista de origens permitidas (inclui todas as páginas relevantes)
    const allowedOrigins = [
        'http://127.0.0.1:5500', // Desenvolvimento local
        'https://adaptado-coffee-value-assessment.vercel.app', // Domínio Vercel
    ];

    const origin = req.headers.origin;

    // Configura CORS
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Menos seguro, mas útil para depuração inicial
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Pré-verificação para OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // URL do Google Apps Script
    const googleAppsScriptURL =
        'https://script.google.com/macros/s/AKfycbzro1SfDHUpNIj3tzym2Nrr4LmFc7PCtS8pLdCkZ1kv2rUalqFhOQydapF-hUiJjXww/exec';

    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Requisição inválida. Corpo da requisição não é JSON válido.' });
        }

        // Faz requisição ao Google Apps Script
        const response = await fetch(googleAppsScriptURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            console.error('Erro na resposta do Google Apps Script:', response.status, response.statusText);
            return res.status(response.status).json({ error: 'Erro na resposta do Google Apps Script' });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Erro no Proxy:', error);
        res.status(500).json({ error: 'Erro ao conectar ao Google Apps Script' });
    }
}
