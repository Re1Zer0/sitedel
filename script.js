let wines = [];
let currentResults = [];

fetch('siteteste1.json')
    .then(response => response.json())
    .then(data => {
        wines = data;
        populateCoutryList();
        
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

   function searchWine() {  
    const nameInput = document.getElementById('searchInput').value.toLowerCase();
    const coutryInput = document.getElementById('searchCoutry').value.toLowerCase();
    const regionInput = document.getElementById('searchRegion').value.toLowerCase();
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    const results = wines.filter(wine => {
        const nameMatch = wine['DESCRIÇÃO'].toLowerCase().includes(nameInput);
        const coutryMatch = wine['PAIS'].toLowerCase().includes(coutryInput);
        const regionMatch = wine['REGIAO'].toLowerCase().includes(regionInput);
        const priceMatch = wine['PREÇO UNT'] >= (minPrice || 0) && wine['PREÇO UNT'] <= (maxPrice || Number.MAX_SAFE_INTEGER);
        return nameMatch && coutryMatch && regionMatch && priceMatch;
        })
        .sort((a, b) => a['PREÇO UNT'] - b['PREÇO UNT']);
        currentResults = results;
    displayResults(results);
   }

function populateCoutryList() {
    const coutrySet = new Set(wines.map(wine => wine['PAIS']));
    const coutryList = document.getElementById('coutryList');
    coutrySet.forEach(coutry => {
        const option = document.createElement('option');
        option.value = coutry;
        coutryList.appendChild(option);
    });
}

function clearSearch(){
    document.getElementById('searchInput').value = '';
    document.getElementById('searchCoutry').value = '';
    document.getElementById('searchRegion').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('resultsTable').innerHTML = '';
}   

function exportToExcel(data) {
    const formattedData = data.map(wine => ({
        ...wine,
        'PREÇO UNT': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(wine['PREÇO UNT'])
    }));
    const ws = XLSX.utils.json_to_sheet(formattedData);
    ws['!cols'] = [
        { wch: 10 }, // COD
        { wch: 40 }, // DESCRIÇÃO
        { wch: 15 }, // SAFRA
        { wch: 10 },  // VOL
        { wch: 10 }, //TP
        { wch: 10 }, //CX
        { wch: 15 }, //PREÇO UNT
        { wch: 15 }, //PREÇO CX
        { wch: 20 }, //VINICOLA
        { wch: 10 }, //TEOR
        { wch: 20 }, //REGIAO
        { wch: 15 }, //PAIS
        { wch: 10 }, //UVA
        { wch: 10 }, //BLEND
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados");
    XLSX.writeFile(wb, "resultados_vinho.xlsx");
}

function displayResults(results) {
    const resultsDiv = document.getElementById('resultsTable');
    resultsDiv.innerHTML = '';

    const table = document.createElement('table');
    let header = table.createTHead();
    let row = header.insertRow(0);

    let headers = ['Descrição', 'Tipo', 'Preço', 'País'];
    headers.forEach((text, index) => {
        let cell = row.insertCell(index);
        cell.innerHTML = `<b>${text}</b>`;
    });

    let tbody = table.appendChild(document.createElement('tbody'));


    results.forEach(wine => {
        let row = tbody.insertRow();
        row.insertCell(0).textContent = wine['DESCRIÇÃO'];
        row.insertCell(1).textContent = wine['TP'];
        let formatarPreco = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(wine['PREÇO UNT']);
        row.insertCell(2).textContent = formatarPreco;
        row.insertCell(3).textContent = wine['PAIS'];
        resultsDiv.appendChild(table);
    });
}