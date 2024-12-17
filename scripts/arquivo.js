// Função para calcular os totais e atualizar o total geral
function calcularTotal(countId, totalId) {
    // Obter o elemento do campo de contagem e o valor
    const countElement = document.getElementById(countId);
    const totalElement = document.getElementById(totalId);
    const ratio = parseInt(document.querySelector(`[id="${countId}"]`).closest('tr').getAttribute('data-ratio'));

    // Calcular o total com base na proporção
    const countValue = parseInt(countElement.value) || 0;
    const totalValue = Math.floor(countValue / ratio);

    // Atualizar o campo de full defects correspondente
    totalElement.value = totalValue; // Apenas número inteiro

    // Atualizar o total geral
    atualizarTotalGeral();
}

// Função para atualizar a soma total geral
function atualizarTotalGeral() {
    let somaTotal = 0;

    // Selecionar todos os campos de full defects
    const totalFields = document.querySelectorAll('input[id^="total-"]');

    // Somar os valores de todos os campos
    totalFields.forEach(field => {
        const value = parseInt(field.value) || 0;
        somaTotal += value;
    });

    // Atualizar o campo totalGeral
    const totalGeralField = document.getElementById('totalGeral');
    totalGeralField.value = somaTotal; // Apenas número inteiro
}

//Função para calculo da porcentagem das amostras
// Função para calcular porcentagem
function calcularPorcentagem(gramasId, porcentagemId) {
    const gramasElement = document.getElementById(gramasId);
    const porcentagemElement = document.getElementById(porcentagemId);
    const sobrasElement = document.getElementById('sobras'); // Verifica o ID do campo "sobras".

    // Verifica se o campo 'sobras' está vazio
    if (sobrasElement.value === "" || isNaN(sobrasElement.value)) {
        alert("Por favor, preencha o campo 'Peso sem defeitos' (sobras) antes de calcular a porcentagem.");
        return; // Interrompe a execução da função se o campo estiver vazio.
    }

    // Obtém os valores
    const gramasValue = parseFloat(gramasElement.value) || 0;
    const sobrasValue = parseFloat(sobrasElement.value) || 1; // Evitar divisão por 0.

    // Calcula a porcentagem
    const porcentagemValue = (gramasValue / sobrasValue) * 100;

    // Exibe o resultado no campo de porcentagem correspondente
    porcentagemElement.value = porcentagemValue.toFixed(1);
}


// Função para enviar dados para a aba Physical_Assessment
// Função auxiliar para capturar os dados do cabeçalho
function capturarDadosCabecalho() {
    const name = document.getElementById('name').value || 'N/A';
    const date = document.getElementById('date').value || 'N/A';
    const purpose = document.getElementById('purpose').value || 'N/A';
    return [name, date, purpose];
}

function limparFormulario() {
    // Seleciona todos os inputs, textareas e selects do documento
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Limpa o valor ou desmarca o campo
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false; // Desmarca checkboxes e radios
        } else {
            input.value = ''; // Limpa campos de texto, número, etc.
        }
    });

    console.log('Formulário limpo com sucesso!');
}

function formularioEstaVazio() {
    // Captura todos os inputs e selects do formulário
    const inputs = document.querySelectorAll('input, select');

    // Verifica se algum input ou select está preenchido
    for (const input of inputs) {
        if (input.type === 'checkbox' || input.type === 'radio') {
            if (input.checked) return false; // Se algum checkbox ou radio estiver marcado
        } else if (input.value.trim() !== '') {
            return false; // Se algum input ou select tiver valor
        }
    }

    // Se nenhum campo estiver preenchido, retorna true (formulário vazio)
    return true;
}

// Função para enviar dados para a aba Physical_Assessment
async function enviarParaPhysicalAssessment() {
    const botaoEnviar = document.getElementById('bt-physical');

    if (formularioEstaVazio()) {
        alert('Por favor, preencha pelo menos um campo do formulário antes de enviar.');
        return; // Interrompe a execução se o formulário estiver vazio
    }
    botaoEnviar.disabled = true;
    // Captura os dados do cabeçalho
    const headerData = capturarDadosCabecalho();

    // Captura o número da amostra
    const sampleNumber = document.getElementById('sample-number').value || 'N/A';

    // Captura as cores selecionadas
    const colors = [];
    const colorCheckboxes = document.querySelectorAll('.color-options input[type="checkbox"]:checked');
    colorCheckboxes.forEach(checkbox => {
        colors.push(checkbox.value);
    });
    const colorsString = colors.length ? colors.join(', ') : 'N/A';

    // Captura os dados da tabela de defeitos físicos
    const tableData = [];
    const rows = document.querySelectorAll('.tabela tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = Array.from(cells).map(cell => {
            const input = cell.querySelector('input');
            return input ? input.value || '0' : null; // Pega somente os valores do input
        }).filter(value => value !== null); // Remove valores nulos (sem input)
        tableData.push(rowData);
    });

    // Achata a tabela de dados para exibição horizontal
    const flatTableData = tableData.reduce((acc, row) => acc.concat(row), []); // Achata os dados

    // Captura o valor do input com id 'total-geral' e coloca em um novo array 'totalGreen'
    const totalGreen = [];
    const totalGeralInput = document.getElementById('totalGeral');
    totalGreen.push(totalGeralInput ? totalGeralInput.value || '0' : '0');

    // Remove o valor do total-geral de flatTableData
    const totalGeralIndex = flatTableData.indexOf(totalGreen[0]);
    if (totalGeralIndex !== -1) {
        flatTableData.splice(totalGeralIndex, 1); // Remove o valor do total-geral de flatTableData
    }

    // Reorganiza os dados para envio
    const rowData = [
        ...headerData, // Adiciona os dados do cabeçalho primeiro
        sampleNumber, 
        colorsString, 
        ...flatTableData, 
        ...totalGreen
    ];

    try {
        // Envia os dados para a aba Physical_Assessment
        const response = await fetch('https://adaptado-coffee-value-assessment.vercel.app/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ aba: 'Physical_Assessment', data: rowData }),
        });

        const result = await response.json();
        if (result.status === 'success') {
            limparFormulario();
            alert('Dados enviados com sucesso para a aba Physical_Assessment!');
        } else {
            alert('Erro ao enviar os dados. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao enviar para o Google Sheets via Proxy:', error);
        alert('Ocorreu um erro ao enviar os dados via proxy. Verifique o console.');
    }finally{
        botaoEnviar.disabled = false;
    }
}

// Função para enviar dados para a aba size-table
async function enviarParaSizeTable() {
    const botaoEnviar = document.getElementById('bt-sizeTabe');

    if (formularioEstaVazio()) {
        alert('Por favor, preencha pelo menos um campo do formulário antes de enviar.');
        return; // Interrompe a execução se o formulário estiver vazio
    }
    botaoEnviar.disabled=true;
    const headerData = capturarDadosCabecalho();

    // Captura o número da amostra
    const sampleNumber = document.getElementById('sample-number').value || 'N/A';

    // Captura os dados da tabela de tamanhos
    const sizeTableData = [];
    const sizeRows = document.querySelectorAll('.size-table tbody tr');
    sizeRows.forEach(row => {
        const sizeCells = row.querySelectorAll('td');
        const sizeRowData = Array.from(sizeCells).map(cell => {
            const input = cell.querySelector('input');
            return input ? input.value || '0' : null; // Pega somente os valores do input
        }).filter(value => value !== null); // Remove valores nulos (sem input)
        sizeTableData.push(sizeRowData);
    });

    // Achata a tabela de tamanhos para exibição horizontal
    const flatSizeTableData = sizeTableData.reduce((acc, row) => acc.concat(row), []); // Achata os dados

    // Reorganiza os dados para envio
    const rowData = [
        ...headerData, // Adiciona os dados do cabeçalho primeiro
        sampleNumber, 
        ...flatSizeTableData
    ];

    try {
        // Envia os dados para a aba size-table
        const response = await fetch('https://adaptado-coffee-value-assessment.vercel.app/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ aba: 'size-table', data: rowData }),
        });

        const result = await response.json();
        if (result.status === 'success') {
            limparFormulario();
            alert('Dados enviados com sucesso para a aba size-table!');
        } else {
            alert('Erro ao enviar os dados. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao enviar para o Google Sheets via Proxy:', error);
        alert('Ocorreu um erro ao enviar os dados via proxy. Verifique o console.');
    } finally{
        botaoEnviar.disabled=false;
    }
}
