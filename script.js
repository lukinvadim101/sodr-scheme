
const allSelectorsElem = [...document.querySelectorAll('.selectpicker')];
let allSelectedOptions = [];

function getSelectValues(select, index, flag = false) {
  const result = [];
  const options = select && select.options;

  for (let i=0; i < options.length; i++) {
    if (options[i].selected) { 
      result.push(options[i].text);
    }
  }
    
  if (flag) { // on change event
    allSelectedOptions[index] = result;
  } else { // сбор первоначальных значений
    allSelectedOptions.push(result);
  }

  return result;
}

allSelectorsElem.forEach((item, index) => item.addEventListener('change', e => {getSelectValues(e.target, index, true);}));// подписка на изменения 
allSelectorsElem.forEach(item=> getSelectValues(item)); // сбор первоначальных значений

function removeAllChildNodes(parent) { // helper
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

const schemeName = document.getElementById('schemeName');
const schemeNameWrapper = document.querySelector('#schemeNameWrapper');

function showSelect(){ 
  const schemeTxt = allSelectedOptions.flat().join(', ');
  if (schemeTxt !== '') {
    removeAllChildNodes(schemeName);
    schemeName.insertAdjacentHTML("beforeend", 
      `<div class='insertSelection'>${schemeTxt}</div>`);
    schemeNameWrapper.classList.remove('hide');
  }
  
}

const applyBtn = document.querySelector('#applyBtn');
applyBtn.addEventListener('click', showSelect);

// имитация данных с бэка
const dataActive = [
  { id: 111,
    name: 'Схема 1',
    regions: ['ЦФО','Северо-Запад'],
    districts: ['Новосибирская область', 'Пермский край'], 
    silos:'',
    crops:'',
    coefficient:'',
    transshipment:'',
    destination:'',
    regim:''
  },
  { 
    id: 112,
    name: 'Схема 2',
    regions: ['Сибирь'],
    districts: '',
    silos:'', 
    crops:['Соя'],
    coefficient:'',
    transshipment:['Без Перевалки'],
    destination:'',
    regim:''
  },

];
const dataArchive = [
  { id: 142,
    name: 'Архивная Схема 1',
    regions: ['Северо-Запад'],
    districts: ['Калининградская область'], 
    silos:'',
    crops:'',
    coefficient:'',
    transshipment:['Перевалка и хранение'],
    destination:'',
    regim:['DAP Калининград']
  },
];

const state = {active: [...dataActive], archive: [...dataArchive]}; // единое состояние

const dataParse = (data, btnParam)=> data.map(({id,name, regions, districts, silos, crops, coefficient, transshipment, destination, regim})=> (
  `<li class="list-group-item d-flex justify-content-between align-items-center" >
    <a class="schemeListInnerText">
      <b class="mr-2">
      ${name + ":"}
      </b>
      ${regions.length > 0 ? regions + ',' : ''}
      ${districts.length > 0 ? districts + ',' : ''}
      ${silos.length > 0 ? silos + ',' : ''}
      ${crops.length > 0 ? crops + ',' : ''}
      ${coefficient.length > 0 ? coefficient + ',' : ''}
      ${transshipment.length > 0 ? transshipment + ',' : ''}
      ${destination.length > 0 ? destination + ',' : ''}
      ${regim.length > 0 ? regim + ',' : ''}
    </a>
    <div>
      <button type="button" class="btn btn-sm ${btnParam === 'Архивировать' ? 'btn-outline-primary' : 'btn-outline-success '} toggleActiveBtn" data-id=${id}>${btnParam}</button>
      <button type="button" class="btn btn-sm btn-outline-danger deleteBtn" data-id=${id}>Удалить</button>
    </div>
  </li> ` 
)).join(' ');

const activeSchemesList = document.querySelector('#active-schemes-list');
activeSchemesList.insertAdjacentHTML('beforeend', dataParse(state.active, 'Архивировать')); // первый рендер списка

// генерация  кнопок в списке
let deleteBtn = [...document.querySelectorAll('.deleteBtn')];
let toggleActiveBtn = [...document.querySelectorAll('.toggleActiveBtn')];

function addBtnsListeners(stateFlag) {
  deleteBtn = [...document.querySelectorAll('.deleteBtn')];
  deleteBtn.forEach((btn)=> btn.addEventListener('click', (ev)=> onDelete(ev, stateFlag)));
  toggleActiveBtn = [...document.querySelectorAll('.toggleActiveBtn')];
  toggleActiveBtn.forEach((btn)=> btn.addEventListener('click', (ev)=> onToggleActive(ev, stateFlag)));
}

const activeSchemesTab = document.querySelector('#active-schemes-tab');
const disabledSchemesTab = document.querySelector('#disabled-schemes-tab');


function reRender (stateFlag){
  disabledSchemesTab.classList.toggle('active');
  activeSchemesTab.classList.toggle('active'); 
  removeAllChildNodes(activeSchemesList);
  if (stateFlag === 'stateActive') {
    activeSchemesList.insertAdjacentHTML('beforeend', dataParse(state.active, 'Архивировать'));
  } else {
    activeSchemesList.insertAdjacentHTML('beforeend', dataParse(state.archive, 'Активировать'));
  } 
  addBtnsListeners(stateFlag);    
};

activeSchemesTab.addEventListener('click', ()=> reRender('stateActive')); 
disabledSchemesTab.addEventListener('click', ()=> reRender('stateArchive')); 

function onDelete(e, stateFlag) {
  const delId = +e.target.dataset.id;

  if (stateFlag === 'stateActive') {
    state.active = state.active.filter(({id}) => id !== delId);
  } else {
    state.archive = state.archive.filter(({id}) => id !== delId);
  }

  reRender(stateFlag);
};

deleteBtn.forEach((btn)=> btn.addEventListener('click', (e)=> onDelete(e, 'stateActive')));

function onToggleActive (e, stateFlag) {
  const elId = +e.target.dataset.id;
  let elIndex = null;
  
  removeAllChildNodes(activeSchemesList);

  if (stateFlag === 'stateActive') {
    elIndex = state.active.findIndex((item) => item.id === elId);
    state.archive.push(state.active[elIndex]);
    state.active = state.active.filter(({id}) => id !== elId);
    activeSchemesList.insertAdjacentHTML('beforeend', dataParse(state.active, 'Архивировать'));
  } else {
    elIndex = state.archive.findIndex((item) => item.id === elId);
    state.active.push(state.archive[elIndex]);
    state.archive = state.archive.filter(({id}) => id !== elId);
    activeSchemesList.insertAdjacentHTML('beforeend', dataParse(state.archive, 'Активировать'));
  }
  addBtnsListeners(stateFlag);
};

toggleActiveBtn.forEach((btn)=> btn.addEventListener('click', (e)=> onToggleActive(e, 'stateActive')));

// deselect func
const deselectAll = ()=>{
  allSelectorsElem.forEach(el => { // очистка селекторв
    $(el).selectpicker('deselectAll');
  });
  schemeNameWrapper.classList.add('hide');
};

const deselectBtn = document.getElementById('deselectBtn');
deselectBtn.addEventListener('click', deselectAll);

// cбор значений по изменению
activeSchemesList.addEventListener('click', (e)=> {
  if (e.target.tagName !== 'A') return; // проверка что клик по элементу
  const activeSchemeItems = e.target.innerText.split(':')[1].split(',').filter(String).map( item => item.trim()); // разбор названия

  deselectAll();

  activeSchemeItems.forEach(item => {
    allSelectorsElem.forEach( el => {
      [...el.options].forEach( opt => {
        if(item === opt.text){
          opt.selected = true; // установка новых значений
          $(el).selectpicker('refresh'); 
        }
      });
    });
  });

  allSelectedOptions = []; // очиистка предидущей выборки
  allSelectorsElem.forEach(item=> getSelectValues(item)); // сбор новых значений
});

const form = document.querySelector('#multiple_select_form');

const onSubmit = (e)=> {
  const name = document.querySelector('#schemeNameInput').value;
  e.preventDefault();
  const {stateFlag} = e.submitter.dataset;

  const newScheme = {
    id: Date.now(),
    name,
    regions: allSelectedOptions[0],
    districts: allSelectedOptions[1], 
    silos: allSelectedOptions[2],
    crops: allSelectedOptions[3],
    coefficient: allSelectedOptions[4],
    transshipment: allSelectedOptions[5],
    destination: allSelectedOptions[6],
    regim: allSelectedOptions[7]
  };

  removeAllChildNodes(activeSchemesList);

  if (stateFlag === 'stateActive') {
    state.active.push(newScheme);
    activeSchemesList.insertAdjacentHTML('beforeend', dataParse(state.active, 'Архивировать')); 
    disabledSchemesTab.classList.add('active');
   
  } else {
    state.archive.push(newScheme);
    activeSchemesList.insertAdjacentHTML('beforeend', dataParse(state.archive, 'Активировать'));
    activeSchemesTab.classList.add('active'); 
  }
  addBtnsListeners(stateFlag);    
  
};

form.addEventListener('submit',onSubmit);

