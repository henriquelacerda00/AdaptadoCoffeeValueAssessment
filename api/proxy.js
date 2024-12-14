import fetch from 'node-fetch';

export default async function handler(req, res) {
    // Habilitar CORS para permitir requisições de outros domínios
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde a requisições OPTIONS, que são feitas antes de requisições POST
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // URL do Google Apps Script
    const googleAppsScriptURL = 'https://script.google.com/macros/s/AKfycbwhE5uAVLNMoR7gTO-rqidvSYFVquP6gJifZ_rnOuNGz5YOlXX8_wzp7pX-DagLsezv/exec';

    try {
        // Faz a requisição POST para o Google Apps Script com os dados recebidos
        const response = await fetch(googleAppsScriptURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body), // Envia o corpo da requisição original
        });

        // Obtém os dados da resposta do Google Apps Script
        const data = await response.json();

        // Retorna os dados para o front-end
        res.status(200).json(data);
    } catch (error) {
        console.error('Erro no Proxy:', error);
        res.status(500).json({ error: 'Erro ao conectar ao Google Apps Script' });
    }
}
