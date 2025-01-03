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
    
    // Captura a data do dispositivo (sempre será a data atual)
    const date = new Date().toLocaleDateString(); // A data do dispositivo será utilizada

    const purpose = document.getElementById('purpose').value || 'N/A';
    return [name, date, purpose];
}

function cabecalhoEstaPreenchido() {
    const headerData = capturarDadosCabecalho();
    return headerData.every(campo => campo !== 'N/A' && campo.trim() !== '');
}

function limparFormularioPorClasse(className) {
    // Seleciona os elementos dentro do formulário com a classe fornecida
    const formulario = document.querySelector(`.${className}`);
    if (!formulario) {
        console.warn(`Nenhum formulário encontrado com a classe: ${className}`);
        return;
    }

    const inputs = formulario.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false; // Desmarca checkboxes e radios
        } else {
            input.value = ''; // Limpa campos de texto, número, etc.
        }
    });

    console.log(`Formulário com a classe "${className}" limpo com sucesso!`);
}


function formularioEstaVazio(sectionSelector = null) {
    // Define o escopo da verificação (documento inteiro ou uma section específica)
    const container = sectionSelector ? document.querySelector(sectionSelector) : document;

    // Captura todos os inputs e selects dentro do container
    const inputs = container.querySelectorAll('input, select');

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
    const sampleNumberField = document.getElementById('sample-number');
    const moistureField = document.getElementById('moisture');

    if (!cabecalhoEstaPreenchido()) {
        alert('Por favor, preencha todos os campos do cabeçalho (name, date e purpose) antes de enviar.');
        return; // Impede o envio
    }

    if (!sampleNumberField.value.trim()) {
        alert('O campo "Sample Number" é obrigatório. Por favor, preencha antes de enviar.');
        sampleNumberField.focus(); // Foca no campo vazio
        return; // Interrompe a execução
    }

    if (formularioEstaVazio('.physical-Section')) {
        alert('Por favor, preencha os campos obrigatórios dentro da seção Physical antes de enviar.');
        return; // Interrompe o envio
    }

    if (!moistureField.value.trim()) {
        alert('O campo "Moisture" é obrigatório. Por favor, preencha antes de enviar.');
        moistureField.focus(); // Foca no campo vazio
        return; // Interrompe a execução
    }

    botaoEnviar.disabled = true;
    // Captura os dados do cabeçalho
    const headerData = capturarDadosCabecalho();

    // Captura o número da amostra
    const sampleNumber = sampleNumberField.value.trim();
    const moisture = moistureField.value.trim();

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
        ...totalGreen,
        moisture
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
            limparFormularioPorClasse('physical-Section');
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
    const botaoEnviarSize = document.getElementById('bt-sizeTabe');
    const sampleNumberField = document.getElementById('sample-number');
    const weightField = document.getElementById('sobras')

    if (!cabecalhoEstaPreenchido()) {
        alert('Por favor, preencha todos os campos do cabeçalho (name, date e purpose) antes de enviar.');
        return; // Impede o envio
    }

    if (!sampleNumberField.value.trim()) {
        alert('O campo "Sample Number" é obrigatório. Por favor, preencha antes de enviar.');
        sampleNumberField.focus(); // Foca no campo vazio
        return; // Interrompe a execução
    }

    if (formularioEstaVazio('.size-Section')) {
        alert('Por favor, preencha os campos obrigatórios dentro da seção Physical antes de enviar.');
        return; // Interrompe o envio
    }

    if(!weightField.value.trim()){
        alert('O campo de "Weight without deffects:" é obrigatorio.')
        weightField.focus();
        return;
    }


    botaoEnviarSize.disabled=true;
    const headerData = capturarDadosCabecalho();

    // Captura o número da amostra
    const sampleNumber = sampleNumberField.value.trim();
    const WeightWtO = weightField.value.trim();
    

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
        WeightWtO, 
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
            limparFormularioPorClasse('size-Section');
            alert('Dados enviados com sucesso para a aba size-table!');
        } else {
            alert('Erro ao enviar os dados. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao enviar para o Google Sheets via Proxy:', error);
        alert('Ocorreu um erro ao enviar os dados via proxy. Verifique o console.');
    } finally{
        botaoEnviarSize.disabled=false;
    }
}

function capturarNotasPorGrupo(grupo) {
    return grupo.map(id => {
        const inputElement = document.getElementById(id);
        // Verifique se o elemento existe e se é uma string antes de aplicar o trim
        if (inputElement && typeof inputElement.value === 'string') {
            return inputElement.value.trim(); // Aplique o trim se for uma string válida
        } else {
            return ''; // Retorne um valor padrão (vazio) caso contrário
        }
    });
}


async function enviarParaDescriptive() {
    const botaoEnviar = document.getElementById('bt-descriptive');
    const sampleNumberField = document.getElementById('sample-no');

    if (!cabecalhoEstaPreenchido()) {
        alert('Por favor, preencha todos os campos do cabeçalho (name, date e purpose) antes de enviar.');
        return; // Impede o envio
    }
    
    if(!sampleNumberField.value.trim()){
        alert('O campo "Sample No." é obrigatorio para envio dos dados.')
        sampleNumberField.focus();
        return;
    }
    botaoEnviar.disabled = true;

    const headerData = capturarDadosCabecalho();
    const sampleNumber = sampleNumberField.value.trim();

    // Capturar os valores das escalas
    const fragranceValue = document.getElementById('scalaFragrance').value;
    const aromaValue = document.getElementById('scalaAroma').value;
    const FlavorValue = document.getElementById('scalaFlavor').value;
    const AfterTasteValue = document.getElementById('scalaAftertaste').value;
    const AcidityValue = document.getElementById('scalaAcidity').value;
    const SweetnessValue = document.getElementById('scalaSweet').value;
    const mouthfeelValue = document.getElementById('scalaMouth').value;

    // Função para capturar os valores dos checkboxes de um grupo
    function capturarCheckboxes(groupName) {
        const checkboxes = document.querySelectorAll(`.${groupName} input[type="checkbox"]`);
        return Array.from(checkboxes).map(checkbox => {
            // Retorna 1 se marcado, 0 se não marcado
            return checkbox.checked ? 1 : 0;
        });
    }

    // Organizar os valores dos checkboxes para cada grupo
    const checkboxesArray1 = capturarCheckboxes('checkbox-group1').map(val => (val === undefined ? 0 : val));
    const checkboxesArray2 = capturarCheckboxes('checkbox-group2').map(val => (val === undefined ? 0 : val));
    const checkboxesArray3 = capturarCheckboxes('checkbox-group3').map(val => (val === undefined ? 0 : val));


    const nota1 = ['notes-1'];  // IDs para as notas de fragrância
    const nota2 = ['notes-2'];  // IDs para as notas de aroma
    const nota3 = ['acidity-notes'];
    const nota4 = ['sweetness-notes'];
    const nota5 = ['mouthfeel-notes'];
    // Adicione mais grupos de IDs conforme necessário

    // Captura as notas de cada grupo
    const notas1 = capturarNotasPorGrupo(nota1);
    const notas2 = capturarNotasPorGrupo(nota2);
    const notas3 = capturarNotasPorGrupo(nota3);
    const notas4 = capturarNotasPorGrupo(nota4);
    const notas5 = capturarNotasPorGrupo(nota5);



    // Organizar os dados a serem enviados
    const rowData = [
        ...headerData,                // Pode ser um array com valores
        sampleNumber,
        fragranceValue,
        aromaValue,
        ...checkboxesArray1,
        ...notas1,
        FlavorValue,
        AfterTasteValue,
        ...checkboxesArray2,
        ...notas2,
        AcidityValue,
        ...notas3,
        SweetnessValue,
        ...notas4,
        mouthfeelValue,
        ...notas5,
        ...checkboxesArray3,
    ];
    

    try {
        // Envia os dados para a API via Proxy
        const response = await fetch('https://adaptado-coffee-value-assessment.vercel.app/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ aba: 'Descriptive-Form', data: rowData }),
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert('Dados enviados com sucesso para a aba Descriptive-Form!');
            limparCamposFormularioDescriptive();
        } else {
            alert('Erro ao enviar os dados. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao enviar para o Google Sheets via Proxy:', error);
        alert('Ocorreu um erro ao enviar os dados via proxy. Verifique o console.');
    } finally {
        botaoEnviar.disabled = false; // Reabilitar o botão de envio
    }
}

function limparCamposFormularioDescriptive() {
    // Limpar inputs do tipo range
    const ranges = document.querySelectorAll('input[type="range"]');
    ranges.forEach(range => {
        range.value = 0;
    });

    // Limpar checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // IDs de todos os campos de notas
    const idsNotas = [
        'notes-1',        // Fragrance notes
        'notes-2',        // Aroma notes
        'acidity-notes',  // Acidity notes
        'sweetness-notes',// Sweetness notes
        'mouthfeel-notes' // Mouthfeel notes
        // Adicione mais IDs conforme necessário
    ];

    // Limpar os valores dos campos de notas
    idsNotas.forEach(id => {
        const nota = document.getElementById(id);
        if (nota) {
            nota.value = '';
        }
    });
}


async function enviarParaAffective() {
    const botaoEnviar = document.getElementById('bt-affective');
    const sampleNumberField = document.getElementById('sample-number');

    if (!cabecalhoEstaPreenchido()) {
        alert('Por favor, preencha todos os campos do cabeçalho (name, date e purpose) antes de enviar.');
        return; // Impede o envio
    }

    if(!sampleNumberField.value.trim()){
        alert('O campo "Sample No." é obrigatorio para envio dos dados.')
        sampleNumberField.focus();
        return;
    }
    const fragranceValor = obterCriteriosIndividual('fragrance');
    const aromaValor = obterCriteriosIndividual('aroma');
    const flavorValor = obterCriteriosIndividual('flavor');
    const afterTasteValor = obterCriteriosIndividual('aftertaste');
    const acidityValor = obterCriteriosIndividual('acidity');
    const sweetnessValor = obterCriteriosIndividual('sweetness');
    const mouthfeelValor = obterCriteriosIndividual('mouthfeel');
    const overallValor = obterCriteriosIndividual('overall');

    if ([fragranceValor, aromaValor, flavorValor, afterTasteValor, acidityValor, sweetnessValor, mouthfeelValor, overallValor].includes(null)) {
        alert('Por favor, preencha todos os critérios antes de enviar.');
        botaoEnviar.disabled = false;
        return;
    }
    
    botaoEnviar.disabled=true;

    const headerData = capturarDadosCabecalho();
    const sampleNumber = sampleNumberField.value.trim();

    const TotalCriterios = [fragranceValor + aromaValor + flavorValor + afterTasteValor + acidityValor +sweetnessValor + mouthfeelValor + overallValor];
    const naoUniformes = obterNumeroNaoUniformes();
    const defects = obterNumeroDefeituosos();

    const nota1 = ['notes-Fr-Ar'];
    const nota2 = ['notes-Fl-Af'];
    const nota3 = ['notes-Acidity'];
    const nota4 = ['notes-Sweetness'];
    const nota5 = ['notes-Mouthfell'];
    const nota6 = ['notes-Overall'];

    const notas1 = capturarNotasPorGrupo(nota1);
    const notas2 = capturarNotasPorGrupo(nota2);
    const notas3 = capturarNotasPorGrupo(nota3);
    const notas4 = capturarNotasPorGrupo(nota4);
    const notas5 = capturarNotasPorGrupo(nota5);
    const notas6 = capturarNotasPorGrupo(nota6);
    
    const somaHi =
        parseFloat(fragranceValor) +
        parseFloat(aromaValor) +
        parseFloat(flavorValor) +
        parseFloat(afterTasteValor) +
        parseFloat(acidityValor) +
        parseFloat(sweetnessValor) +
        parseFloat(mouthfeelValor) +
        parseFloat(overallValor);
        
    const S = (0.65625 * somaHi) + 52.75 - (2 * naoUniformes) - (4 * defects);

    const rowData = [
        ...headerData,
        sampleNumber,
        fragranceValor,
        aromaValor,
        ...notas1,
        flavorValor,
        afterTasteValor,
        ...notas2,
        acidityValor,
        ...notas3,
        sweetnessValor,
        ...notas4,
        mouthfeelValor,
        ...notas5,
        overallValor,
        ...notas6,
        naoUniformes,
        defects,
        S.toFixed(2)
    ]

    console.log('somaHi:', somaHi);
    console.log('naoUniformes:', naoUniformes);
    console.log('defects:', defects);
    console.log('S:', S);
    console.log('totalCriterio:',TotalCriterios);




    try {
        // Envia os dados para a API via Proxy
        const response = await fetch('https://adaptado-coffee-value-assessment.vercel.app/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ aba: 'Affective-Form', data: rowData }),
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert('Dados enviados com sucesso para a aba Affective-Form!');
            limparCamposFormularioAffective();
        } else {
            alert('Erro ao enviar os dados. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao enviar para o Google Sheets via Proxy:', error);
        alert('Ocorreu um erro ao enviar os dados via proxy. Verifique o console.');
    } finally {
        botaoEnviar.disabled = false; // Reabilitar o botão de envio
    }
}



function obterNumeroNaoUniformes() {
    const checkboxes = document.querySelectorAll('.checkboxesNON input[type="checkbox"]');
    if (!checkboxes.length) {
        console.warn("Nenhuma checkbox encontrada para 'Non-Uniform Cups'. Retornando 0.");
        return 0;
    }
    return Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
}

function obterNumeroDefeituosos() {
    const checkboxes = document.querySelectorAll('.checkboxesDF input[type="checkbox"]');
    if (!checkboxes.length) {
        console.warn("Nenhuma checkbox encontrada para 'Defective Cups'. Retornando 0.");
        return 0;
    }
    return Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
}

function obterCriteriosIndividual(groupId) {
    const group = document.querySelector(`#${groupId}`);
    const selected = group.querySelector('input[type="radio"]:checked');
    return selected ? selected.value : null;
}

function limparCamposFormularioAffective() {
    // Limpa todos os botões de rádio selecionados
    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => radio.checked = false);

    // Limpa todos os checkboxes marcados
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => checkbox.checked = false);

    // Limpa os campos de notas (assumindo que as notas estão em inputs de texto ou áreas de texto)
    document.querySelectorAll('.notas input[type="text"], .notas textarea').forEach(nota => nota.value = '');
}


async function enviarParaExtrisinc(){
    const botaoEnviar = document.getElementById('bt-extrinsic');
    const sampleNumberField = document.getElementById('sample-no');

    if (!cabecalhoEstaPreenchido()) {
        alert('Por favor, preencha todos os campos do cabeçalho (name, date e purpose) antes de enviar.');
        return; // Impede o envio
    }

    if(!sampleNumberField.value.trim()){
        alert('O campo "Sample No." é obrigatorio para envio dos dados.')
        sampleNumberField.focus();
        return;
    }
    botaoEnviar.disabled=true;

    const headerData = capturarDadosCabecalho();
    const sampleNumber = sampleNumberField.value.trim();

    function capturarCheckboxes(groupName) {
        const checkboxes = document.querySelectorAll(`.${groupName} input[type="checkbox"]`);
        return Array.from(checkboxes).map(checkbox => {
            // Retorna 1 se marcado, 0 se não marcado
            return checkbox.checked ? 1 : 0;
        });
    }

    const checkboxesFarming = capturarCheckboxes('farming').map(val => (val === undefined ? 0 : val));
    const checkboxesProcessing = capturarCheckboxes('processing').map(val => (val === undefined ? 0 : val));
    const checkboxesTrading = capturarCheckboxes('trading').map(val => (val === undefined ? 0 : val));
    const checkboxesCertifications = capturarCheckboxes('certifications').map(val => (val === undefined ? 0 : val));


    const nota1 = ['notes-1'];
    const nota2 = ['notes-2'];
    const nota3 = ['notes-3'];
    const nota4 = ['notes-4'];
    const nota5 = ['notes-5'];

    const notas1 = capturarNotasPorGrupo(nota1);
    const notas2 = capturarNotasPorGrupo(nota2);
    const notas3 = capturarNotasPorGrupo(nota3);
    const notas4 = capturarNotasPorGrupo(nota4);
    const notas5 = capturarNotasPorGrupo(nota5);
    
    const rowData = [
        ...headerData,
        sampleNumber,
        ...checkboxesFarming,
        ...notas1,
        ...checkboxesProcessing,
        ...notas2,
        ...checkboxesTrading,
        ...notas3,
        ...checkboxesCertifications,
        ...notas4,
        ...notas5

    ]


    try {
        // Envia os dados para a API via Proxy
        const response = await fetch('https://adaptado-coffee-value-assessment.vercel.app/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ aba: 'Extrisinc-Beta', data: rowData }),
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert('Dados enviados com sucesso para a aba Extrisinc-Beta!');
            limparFormularioPorClasse('form-container');
        } else {
            alert('Erro ao enviar os dados. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao enviar para o Google Sheets via Proxy:', error);
        alert('Ocorreu um erro ao enviar os dados via proxy. Verifique o console.');
    } finally {
        botaoEnviar.disabled = false; // Reabilitar o botão de envio
    }
}