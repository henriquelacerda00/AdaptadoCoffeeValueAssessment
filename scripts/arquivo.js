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

    // Obtém os valores
    const gramasValue = parseFloat(gramasElement.value) || 0;
    const sobrasValue = parseFloat(sobrasElement.value) || 1; // Evitar divisão por 0.

    // Calcula a porcentagem
    const porcentagemValue = (gramasValue / sobrasValue) * 100;

    // Exibe o resultado no campo de porcentagem correspondente
    porcentagemElement.value = porcentagemValue.toFixed(1);
}


//gerar excel 
function gerarExcel() {
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
            // Verifica se a célula é um campo de input e pega o valor
            const input = cell.querySelector('input');
            return input ? input.value || '0' : cell.textContent;
        });
        tableData.push(rowData);
    });

    // Captura os dados da tabela de tamanhos
    const sizeTableData = [];
    const sizeRows = document.querySelectorAll('.size-table tbody tr');
    sizeRows.forEach(row => {
        const sizeCells = row.querySelectorAll('td');
        const sizeRowData = Array.from(sizeCells).map(cell => {
            const input = cell.querySelector('input');
            return input ? input.value || '0' : cell.textContent;
        });
        sizeTableData.push(sizeRowData);
    });

    // Dados para a planilha
    const worksheetData = [
        ['Sample Number', sampleNumber],
        ['Colors', colorsString],
        [], // Linha vazia para separação
        ['Physical Defects', 'Ratio', 'Defect Count', 'Full Defects', 'TOTAL GREEN DEFECTS'],
        ...tableData,
        [], // Linha vazia para separar as duas seções
        ['Size', 'g', '%'], // Cabeçalhos da tabela de tamanhos
        ...sizeTableData // Adicionando apenas uma vez a tabela de tamanhos
    ];

    // Cria a planilha
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Physical Assessment');

    const columnWidths = worksheetData[0].map((col, index) => {
        let maxLength = 0;
        worksheetData.forEach(row => {
            if (row[index] && row[index].length > maxLength) {
                maxLength = row[index].length;
            }
        });
        return maxLength < 10 ? 10 : maxLength + 2; // Ajuste a largura mínima
    });

    worksheet['!cols'] = columnWidths.map(width => ({ wpx: width * 5 })); // Multiplica por 10 para ajustar em pixels

    // Definir estilo para quebra automática de linha
    worksheet['!rows'] = worksheetData.map(row => ({
        hpt: 25 // Altura da linha (pode ser ajustada)
    }));

    // Salva o arquivo
    XLSX.writeFile(workbook, 'Physical_Assessment.xlsx');
}

