const load_button = document.getElementById('load-button');
const back_button = document.getElementById('back-button');
const search_button_name = document.getElementById('search-button-name');
const search_button_id = document.getElementById('search-button-id');
const search_form_name = document.getElementById('search-form-name');
const search_form_id = document.getElementById('search-form-id');
const end_page = document.getElementById('end-page');
const sectionCards = document.querySelector('.section-cards');
const modal = document.getElementById('modal-card');
const closeModal = document.getElementById('close-modal');
const button_left = document.getElementById("button-left");
const button_right = document.getElementById("button-right");
let countCards = 21;
let countImages = 0;

chargePage();
button_left.disabled = true;


load_button.addEventListener("click", function () {
    if (countCards <= 1302) {
        duplicateCard(21);
        changeContentCards();
        countCards += 21;
        addEventListenersToCards();
    }

});

search_form_name.addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('name-form').value;

    if (name) {
        await chargeSearchedByName(name);
    }

});

search_form_id.addEventListener('submit', function (event) {
    event.preventDefault();


    const range1 = parseInt(document.getElementById('answer-range1').value, 10);
    const range2 = parseInt(document.getElementById('answer-range2').value, 10);



    if (!isNaN(range1) && !isNaN(range2)) {
        removeElements();
        for (let i = range1; i <= range2; i++) {
            chargeSearchedByOneId(i);
        }
    }

    if (isNaN(range1) && !isNaN(range2)) {
        removeElements();
        for (let i = 1; i <= range2; i++) {
            chargeSearchedByOneId(i);
        }
    }

    if (!isNaN(range1) && isNaN(range2)) {
        removeElements();
        chargeSearchedByOneId(range1);
    }

});

back_button.addEventListener('click', function () {
    location.reload();
});


section.addEventListener("click", function (event) {
    const card = event.target.closest('.card');
    if (!card) return;
    const cardNumber = card.querySelector('#textCardNumber').textContent;
    const cardName = card.querySelector('#textName').textContent;
    const cardWeight = card.querySelector('#textWeight').textContent;
    const cardImageSrc = card.querySelector('#cardImage').src;

    const cardTypes = [];
    const typeSquares = card.querySelectorAll('.type-square');
    typeSquares.forEach(el => {
        cardTypes.push(el.textContent);
    });

    document.getElementById('modalTextCardNumber').textContent = cardNumber;
    document.getElementById('modalTextName').textContent = cardName;
    document.getElementById('modalTextWeight').textContent = cardWeight;
    document.getElementById('modalCardImage').src = cardImageSrc;

    const modalTypeContainer = document.getElementById('modalTypeContainer');
    modalTypeContainer.innerHTML = '';
    cardTypes.forEach(type => {
        const typeSquare = document.createElement('div');
        typeSquare.classList.add('type-square');
        typeSquare.textContent = type;
        typeSquare.style.backgroundColor = returnColor(type);
        modalTypeContainer.appendChild(typeSquare);
    });

    const pokemonId = parseInt(cardNumber.replace('#', ''), 10);
    const statsUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;

    fetch(statsUrl)
        .then(response => response.json())
        .then(data => {

            const pokemonHeight = data.height;
            const formattedHeight = (pokemonHeight / 10);


            const heightElement = document.getElementById('modalTextHeight');
            heightElement.textContent = `${formattedHeight} m`;


            const hpStat = data.stats.find(stat => stat.stat.name === 'hp').base_stat;
            const attackStat = data.stats.find(stat => stat.stat.name === 'attack').base_stat;
            const defenseStat = data.stats.find(stat => stat.stat.name === 'defense').base_stat;
            const hpBar = document.querySelector('.stat-bar-fill.hp');
            const attackBar = document.querySelector('.stat-bar-fill.attack');
            const defenseBar = document.querySelector('.stat-bar-fill.defense');

            console.log('hpBar:', hpBar);
            console.log('attackBar:', attackBar);
            console.log('defenseBar:', defenseBar);

            if (hpBar && attackBar && defenseBar) {
                hpBar.style.width = `${hpStat}%`;
                attackBar.style.width = `${attackStat}%`;
                defenseBar.style.width = `${defenseStat}%`;
            } else {
                console.error("One or more stat bars are not found in the DOM");
            }


        })
        .catch(error => {
            console.error('Error fetching the Pokémon stats:', error);
        });



    modal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    const hpBar = document.querySelector('.stat-bar-fill.hp');
    const attackBar = document.querySelector('.stat-bar-fill.attack');
    const defenseBar = document.querySelector('.stat-bar-fill.defense');
    hpBar.style.width = `${0}%`;
    attackBar.style.width = `${0}%`;
    defenseBar.style.width = `${0}%`;
    heightElement.textContent = " ";
    countImages=0;
    button_left.disabled = true;
});


window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

button_right.addEventListener("click", async function () {
    const cardNumberElement = document.getElementById('modalTextCardNumber');
    const cardNumberText = cardNumberElement.textContent;
    const pokemonId = parseInt(cardNumberText.replace('#', ''), 10);

    images = await getPokemonImages(pokemonId);


    const modalImage = document.getElementById('modalCardImage'); 

    
    if (countImages < images.length - 1) {
        countImages++;
        modalImage.src = images[countImages]; 
        checkImagesPlaced(); 
    }
});

button_left.addEventListener("click", async function () {
    const cardNumberElement = document.getElementById('modalTextCardNumber');
    const cardNumberText = cardNumberElement.textContent;
    const pokemonId = parseInt(cardNumberText.replace('#', ''), 10);


    images = await getPokemonImages(pokemonId);

    const modalImage = document.getElementById('modalCardImage');

    if (countImages > 0) {
        countImages--;
        modalImage.src = images[countImages];
        checkImagesPlaced(); 
    }
});
function checkImagesPlaced() {
    button_left.disabled = countImages === 0;
    button_right.disabled = countImages === images.length - 1;
}



function removeElements() {

    const clonedCards = document.querySelectorAll('.cloned-card');

    clonedCards.forEach(card => {
        card.remove();
    });
}

async function searchPokemonByName(name) {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000'); // Límite ajustable
        const data = await response.json();

        const pokemonesFiltrados = data.results.filter(pokemon => pokemon.name.includes(name.toLowerCase()));

        const ids = await Promise.all(pokemonesFiltrados.map(async (pokemon) => {
            const pokemonData = await fetch(pokemon.url);
            const pokemonInfo = await pokemonData.json();
            return pokemonInfo.id;
        }));

        return ids;
    } catch (error) {
        console.error("Error searching for the pokemon:", error);
    }
}

async function changeContentOne(pokemonId, card) {

    try {

        const atributes = await getPokemonAtributes(pokemonId);
        const type = await getPokemonType(pokemonId);
        const images = await getPokemonImages(pokemonId);

        if (!atributes || !type || !images) {
            throw new Error("Information not gathered");
        }


        const [name, weight] = atributes;
        const cardNumber = `#${pokemonId.toString().padStart(4, '0')}`;
        const textCardNumber = card.querySelector('#textCardNumber');
        const textName = card.querySelector('#textName');
        const textType = card.querySelector('#textType');
        const textWeight = card.querySelector('#textWeight');
        const cardImage = card.querySelector('#cardImage');
        const typeContainer = card.querySelector('.type-container');

        if (textCardNumber && textName && textType && textWeight && cardImage) {

            textCardNumber.textContent = cardNumber;
            textName.textContent = name;
            textType.textContent = type[0];


            while (typeContainer.firstChild) {
                typeContainer.removeChild(typeContainer.firstChild);
            }


            type.forEach(t => {
                const typeSquare = document.createElement('div');
                typeSquare.classList.add('type-square');
                typeSquare.textContent = t;
                typeSquare.style.backgroundColor = returnColor(t);
                typeContainer.appendChild(typeSquare);
            });

            textWeight.textContent = `${weight / 10}kg`;
            cardImage.src = images[0];

            card.style.display = 'flex';
        } else {
            console.error("One or more elemnts were not found in the dome for the card: ", pokemonId);
        }
    } catch (error) {
        console.error(`Error in charging pokemon ${pokemonId}:`, error);
    }
}

async function getPokemonAtributes(pokemonId) {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonId}/`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        const pokemonName = data.name;
        const pokemonWeight = data.weight;
        const pokemonHeight = data.height;
        const pokemonBaseExperience = data.base_experience;
        const atributesPokemon = [pokemonName, pokemonWeight, pokemonHeight, pokemonBaseExperience];
        return atributesPokemon;
    } catch (error) {
        console.error(error);
    }
}

async function getPokemonType(pokemonId) {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonId}/`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        const array_types = [];
        if (data && data.types && data.types.length > 0) {
            for (let i = 0; i < data.types.length; i++) {
                array_types.push(data.types[i].type.name);
            }
            return array_types;
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
    }
}


async function getPokemonImages(pokemonId) {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonId}/`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        const images = [];

        if (data && data.sprites) {
            images.push(data.sprites.front_default);
            images.push(data.sprites.back_default);
            images.push(data.sprites.front_shiny);
            images.push(data.sprites.back_shiny);
            return images;
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
    }
}


function duplicateCard(numberOfCopies) {
    const cardContainer = document.getElementById('section');
    const originalCard = document.getElementById('idCard');

    for (let i = 0; i < numberOfCopies; i++) {
        const clonedCard = originalCard.cloneNode(true);
        clonedCard.classList.add('card');
        clonedCard.classList.add('cloned-card');
        cardContainer.appendChild(clonedCard);
    }
}

async function changeContentCards() {
    const cards = document.querySelectorAll('.card');

    for (let i = 0; i <= cards.length; i++) {
        let pokemonId = (i + 1);

        try {

            const atributes = await getPokemonAtributes(pokemonId);
            const type = await getPokemonType(pokemonId);
            const images = await getPokemonImages(pokemonId);

            if (!atributes || !type || !images) {
                throw new Error("Information not gathered");
            }


            const [name, weight] = atributes;
            const cardNumber = `#${pokemonId.toString().padStart(4, '0')}`;
            let card = cards[pokemonId];
            const textCardNumber = card.querySelector('#textCardNumber');
            const textName = card.querySelector('#textName');
            const textType = card.querySelector('#textType');
            const textWeight = card.querySelector('#textWeight');
            const cardImage = card.querySelector('#cardImage');
            const typeContainer = card.querySelector('.type-container');

            if (textCardNumber && textName && textType && textWeight && cardImage) {

                textCardNumber.textContent = cardNumber;
                textName.textContent = name;
                textType.textContent = type[0];


                while (typeContainer.firstChild) {
                    typeContainer.removeChild(typeContainer.firstChild);
                }


                type.forEach(t => {
                    const typeSquare = document.createElement('div');
                    typeSquare.classList.add('type-square');
                    typeSquare.textContent = t;
                    typeSquare.style.backgroundColor = returnColor(t);
                    typeContainer.appendChild(typeSquare);
                });

                textWeight.textContent = `${weight / 10}kg`;
                cardImage.src = images[0];

                card.style.display = 'flex';
            } else {
                console.error("One or more elemnts were not found in the dome for the card: ", pokemonId);
            }
        } catch (error) {
            console.error(`Error in charging pokemon ${pokemonId}:`, error);
        }
    }
}


function returnColor(type) {

    if (type == "normal") {
        return "#c1c1c1"
    }
    if (type == "fighting") {
        return "#ffcfa0"
    }
    if (type == "flying") {
        return "#ccf3ff"
    }
    if (type == "poison") {
        return "#ebccff"
    }
    if (type == "ground") {
        return "#9a7f7f"
    }
    if (type == "rock") {
        return "#b8b48d"
    }
    if (type == "bug") {
        return "#98c58e"
    }
    if (type == "ghost") {
        return "#8e9ac5"
    }
    if (type == "steel") {
        return "#9394a3"
    }
    if (type == "fire") {
        return "#ffb0b0"
    }
    if (type == "grass") {
        return "#b2ffb0"
    }
    if (type == "electric") {
        return "#fffdb0"
    }
    if (type == "psychic") {
        return "#ffb0f8"
    }
    if (type == "ice") {
        return "#b0baff"
    }
    if (type == "dragon") {
        return "#ffc192"
    }
    if (type == "dark") {
        return "#858483"
    }
    if (type == "fairy") {
        return "#ffd9f3"
    }
    if (type == "stellar") {
        return "#5d5c98"
    }
    if (type == "water") {
        return "#8d8ce9"
    }
}

function chargePage() {
    duplicateCard(21);
    changeContentCards();
    load_button.style.display = "flex";
}


async function chargeSearchedByName(name) {
    const ids = await searchPokemonByName(name);
    removeElements();
    load_button.style.display = "none";
    back_button.style.display = "flex";

    ids.forEach(id => {
        duplicateCard(1);
        const cards = document.querySelectorAll(".card");
        const lastCard = cards[cards.length - 1];
        changeContentOne(id, lastCard);
    });
}

function chargeSearchedByOneId(id) {
    load_button.style.display = "none";
    end_page.style.display = "flex";
    back_button.style.display = "flex";
    duplicateCard(1);
    const cards = document.querySelectorAll(".card");
    const lastCard = cards[cards.length - 1];
    changeContentOne(id, lastCard);
}

