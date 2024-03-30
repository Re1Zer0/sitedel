let wines = [];
let currentResults = [];

fetch('siteteste1.json')
    .then(response => response.json())
    .then(data => {
        wines = data;
        populateCountryList();
        populateTypeList();
        
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

   
function populateCountryList() {
    const countrySet = new Set(wines.map(wine => wine['PAIS']));
    const countryList = document.getElementById('countryList');
    countrySet.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        countryList.appendChild(option);
    });
    }
    
function populateTypeList() {
    const typeSet = new Set(wines.map(wine => wine['TP']));
    const typeList = document.getElementById('typeList');
    typeSet.forEach(type => { 
        const option = document.createElement('option');
        option.value = type;
        typeList.appendChild(option);
    });
    }
   
function searchWine() {  
    const nameInput = document.getElementById('searchInput').value.toLowerCase();
    const countryInput = document.getElementById('searchCountry').value.toLowerCase();
    const regionInput = document.getElementById('searchRegion').value.toLowerCase();
    const typeInput = document.getElementById('searchType').value.toLowerCase();
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Number.MAX_SAFE_INTEGER;
    const results = wines.filter(wine => {
        const unitPrice = parseFloat(wine['PREÇO UNT']);
        const priceMatch = unitPrice >= minPrice && unitPrice <= maxPrice;
        const nameMatch = wine['DESCRIÇÃO'].toLowerCase().includes(nameInput);
        const countryMatch = wine['PAIS'].toLowerCase().includes(countryInput);
        const regionMatch = wine['REGIAO'].toLowerCase().includes(regionInput);
        const typeMatch = wine['TP'].toLowerCase().includes(typeInput);
        
        return nameMatch && countryMatch && regionMatch && typeMatch && priceMatch;
        })
        .sort((a, b) => a['PREÇO UNT'] - b['PREÇO UNT']);
    currentResults = results;
    displayResults(results);
   }



function clearSearch(){
    document.getElementById('searchInput').value = '';
    document.getElementById('searchCountry').value = '';
    document.getElementById('searchRegion').value = '';
    document.getElementById('searchType').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('discount').value = '';
    document.getElementById('increase').value = '';
    document.getElementById('resultsTable').innerHTML = '';
}   

function exportToExcel() {
    const discount = parseFloat(document.getElementById('discount').value / 100) || 0;
    const increase = parseFloat(document.getElementById('increase').value / 100) || 0;
    const adjustedData = currentResults.map(wine => {
        const adjustedUnitPrice = wine['PREÇO UNT'] * (1 - discount) * (1 + increase);
        const adjustedBoxPrice = wine['PRÇ CX'] * (1 - discount) * (1 + increase);
        return {
            ...wine,
            'PREÇO UNT': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(adjustedUnitPrice),
            'PRÇ CX': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(adjustedBoxPrice)
        };     
    });
    const ws = XLSX.utils.json_to_sheet(adjustedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados");
    XLSX.writeFile(wb, "resultados_vinho.xlsx");
}

function displayResults(results) {
    const discount = parseFloat(document.getElementById('discount').value / 100) || 0;
    const increase = parseFloat(document.getElementById('increase').value / 100) || 0;
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
        const originalPrice = parseFloat(wine['PREÇO UNT']);
        const adjustedPrice = originalPrice * (1 - discount) * (1 + increase);
        let formatarPreco = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(adjustedPrice);
        row.insertCell(2).textContent = formatarPreco;
        row.insertCell(3).textContent = wine['PAIS'];
        
    });
resultsDiv.appendChild(table);
}