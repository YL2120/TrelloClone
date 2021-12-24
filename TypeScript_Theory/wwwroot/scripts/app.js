const itemsContainer = document.querySelectorAll(".items-container"); // on prend tous nos containers.
//Variables dynamiques
let actualContainer, actualBtn, actualUL, actualForm, actualTextInput, actualValidation;
function addContainerListeners(currentContainer) {
    const currentContainerDeletionBtn = currentContainer.querySelector(".delete-container-btn"); //on sélectionne le bouton du container qu'on fait passer en paramètre
    const currentAddItemBtn = currentContainer.querySelector('.add-item-btn');
    const currentCloseFormBtn = currentContainer.querySelector(".close-form-btn");
    const currentForm = currentContainer.querySelector("form");
    deleteBtnListeners(currentContainerDeletionBtn);
    addItemBtnListeners(currentAddItemBtn);
    closingFormBtnListeners(currentCloseFormBtn);
    addFormSubmitListeners(currentForm);
    addDDListeners(currentContainer); //ls événements de drag & drop
}
itemsContainer.forEach((container) => {
    addContainerListeners(container);
});
//FONCTIONS D'add event listener
function deleteBtnListeners(btn) {
    btn.addEventListener("click", handleContainerDeletion);
}
function addItemBtnListeners(btn) {
    btn.addEventListener("click", handleAddItem);
}
function closingFormBtnListeners(btn) {
    btn.addEventListener("click", () => toggleForm(actualBtn, actualForm, false)); //si j'ai accès  au bouton, cela veut dire que j'ai accès à un formulaire qui est ouvert.
}
function addFormSubmitListeners(form) {
    form.addEventListener("submit", createNewItem);
}
function addDDListeners(element) {
    element.addEventListener("dragstart", handleDragStart); //Quand on commence à glisser qlq chose
    element.addEventListener("dragover", handleDragOver);
    element.addEventListener("drop", handleDrop);
    element.addEventListener("dragover", handleDragEnd);
}
//FONCTIONS d'action
function handleContainerDeletion(e) {
    const btn = e.target;
    console.log(btn);
    const btnsArray = [...document.querySelectorAll('.delete-container-btn')]; //on veut tous les boutons qui servent à fermer les containers, on attend un tableau avec seulement des boutons à l'intérieur
    const containers = [...document.querySelectorAll('.items-container')]; // on a accès à plus de méthode de cette façon par rapport à une nodelist classique
    containers[btnsArray.indexOf(btn)].remove(); //[index du bouton par rapport aux tableaux de boutons]
}
function handleAddItem(e) {
    const btn = e.target; //sur quel bouton je viens de cliquer
    if (actualContainer) //si un container est déjà ouvert, on le ferme
        toggleForm(actualBtn, actualForm, false);
    setContainerItems(btn);
    toggleForm(actualBtn, actualForm, true); //On ouvre le nouveau formulaire
}
function toggleForm(btn, form, action) {
    if (!action) {
        form.style.display = "none";
        btn.style.display = "block";
    }
    else if (action) {
        form.style.display = "block";
        btn.style.display = "none";
    }
}
function setContainerItems(btn) {
    actualBtn = btn;
    actualContainer = btn.parentElement; //le parent de notre button c'est notre container
    actualUL = actualContainer.querySelector("ul");
    actualForm = actualContainer.querySelector("form");
    actualTextInput = actualContainer.querySelector("input");
    actualValidation = actualContainer.querySelector(".validation-msg");
}
function createNewItem(e) {
    e.preventDefault(); //on évite le refresh de la page
    if (actualTextInput.value.length === 0) { //on vérifie si l'input n'est pas vide
        actualValidation.textContent = "Must be at least 1 character long";
        return; // on n'exécute pas la suite
    }
    else {
        actualValidation.textContent = "";
    }
    //Création Item
    const itemContent = actualTextInput.value;
    const li = `<li class="item" draggable="true">
    <p>${itemContent}</p>
    <button>X</button>
    </li>`;
    actualUL.insertAdjacentHTML("beforeend", li); //1er param : où on place l"élément 2ème param : quel élément place-t-on
    const item = actualUL.lastElementChild; //élément qu'on vient d'ajouter
    const liBtn = item.querySelector("button");
    handleItemDeletion(liBtn); //permet de supprimer l'item
    addDDListeners(item); //on ajoute les évènements drag & drop à notre li
    actualTextInput.value = "";
}
function handleItemDeletion(btn) {
    btn.addEventListener("click", () => {
        const elToRemove = btn.parentElement;
        elToRemove.remove();
    });
}
// Drag And Drop
let dragSrcEl;
function handleDragStart(e) {
    var _a;
    e.stopPropagation(); //si on veut déplacer li, on ne veut pas que tout le container associé bouge aussi
    if (actualContainer) //si il y a qlq chose dans le container
        toggleForm(actualBtn, actualForm, false);
    dragSrcEl = this; //this est ce que je vais dropper
    (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData("text/html", this.innerHTML); //on copie l'inner HTML de l'élément qu'on vient de soulever
}
function handleDragOver(e) {
    e.preventDefault(); //le drag & drop ne fonctionnera pas si on ne met pas ça
}
function handleDrop(e) {
    var _a, _b;
    e.stopPropagation();
    const receptionEl = this; //this va être la réception
    if (dragSrcEl.nodeName === "LI" && receptionEl.classList.contains("items-container")) {
        (_a = receptionEl.querySelector("ul")) === null || _a === void 0 ? void 0 : _a.appendChild(dragSrcEl); //Si on est avec un li et que là où on va le dropper (la réception) est un container vide. syntaxe alternative : (receptionEl.querySelector("ul") as HTMLUListElement).appendChild(dragSrcEl) ;
        addDDListeners(dragSrcEl); //qd le drag & drop est terminé, les évènements disparaissent donc il faut les réajouter.
        handleItemDeletion(dragSrcEl.querySelector("button")); //on rajoute les évènements de suppression à l'élément qu'on vient d'ajouter
    }
    if (dragSrcEl !== this && this.classList[0] === dragSrcEl.classList[0]) { //on est dans le cas où on souhaite swap un item avec un autre item ou un container avec un autre container. (Si l'élémént que je suis entrain de glisser est diffèrent de là où je souhaite le poser et que les classes correspondent (container avec container, item avec item) )
        dragSrcEl.innerHTML = this.innerHTML; //l'élément qu'on est en train de swapper va prendre l'innerhtml de l'élément où on l'a posé
        this.innerHTML = (_b = e.dataTransfer) === null || _b === void 0 ? void 0 : _b.getData("text/html"); //on prend les données qu'on a enregistrées préalablement quand on a commencé à glisser. L'élément sur lequel est posé l'autre élément va prendre le contenu de cet autre élément. Le swap est une illusion car en réalité on ne fait que changer l'inner HTML.
        if (this.classList.contains("items-container")) { //si c'est un container
            //on ajoute les éléments à ce qu'on vient de swapper
            addContainerListeners(this);
            this.querySelectorAll("li").forEach((li) => {
                handleItemDeletion(li.querySelector("button"));
                addDDListeners(li);
            });
        }
        else { //si c'est un item
            addDDListeners(this); //on lui ajoute les évènements de drag & drop
            handleItemDeletion(this.querySelector("button")); //on lui ajoute les évènements à supprimer
        }
    }
}
function handleDragEnd(e) {
    e.stopPropagation();
    if (this.classList.contains("items-container")) { //si l'élément qui s'est fait swapper est un container
        addContainerListeners(this);
        this.querySelectorAll("li").forEach((li) => {
            handleItemDeletion(li.querySelector("button"));
            addDDListeners(li);
        });
    }
    else {
        addDDListeners(this);
    }
}
//Add new container
const addContainerBtn = document.querySelector(".add-container-btn");
const addContainerForm = document.querySelector(".add-new-container form"); //"add-new-container" est le parent
const addContainerFormInput = document.querySelector(".add-new-container input");
const validationNewContainer = document.querySelector(".add-new-container .validation-msg");
const addContainerCloseBtn = document.querySelector(".close-add-list");
const addNewContainer = document.querySelector(".add-new-container");
const containersList = document.querySelector(".main-content");
//déroulement
addContainerBtn.addEventListener("click", () => {
    toggleForm(addContainerBtn, addContainerForm, true);
});
//fermeture
addContainerCloseBtn.addEventListener("click", () => {
    toggleForm(addContainerBtn, addContainerForm, false);
});
//ajout
addContainerForm.addEventListener("submit", createNewContainer);
function createNewContainer(e) {
    e.preventDefault(); //on évite le refresh de la page
    if (addContainerFormInput.value.length === 0) { //on vérifie si l'input n'est pas vide
        validationNewContainer.textContent = "Must be at least 1 character long";
        return; // on n'exécute pas la suite
    }
    else {
        validationNewContainer.textContent = "";
    }
    const itemsContainer = document.querySelector(".items-container");
    const newContainer = itemsContainer.cloneNode(); //on vient cloner le nodeelement (ici une div de base) on clone l'enveloppe extérieure
    const newContainerContent = `
    <div class="top-container">
        <h2>${addContainerFormInput.value}</h2>
        <button class="delete-container-btn">X</button>
    </div>
    <ul></ul>
    <button class="add-item-btn">Add an item</button> 
    <form autocomplete="off">
        <div class="top-form-container">
            <label for="item">Add a new item</label>
            <button type="button" class="close-form-btn">X</button>
        </div>
        <input type="text" id="item">
        <span class="validation-msg"></span>
        <button type="submit">Submit</button>
    </form>
`; //on lui met le contenu avec ce qui va changer
    newContainer.innerHTML = newContainerContent; //on place le contenu à l'intérieur
    containersList.insertBefore(newContainer, addNewContainer); //on insère notre container entre les 2 paramètres
    addContainerFormInput.value = "";
    addContainerListeners(newContainer); //on fait appel à cette fonction pour pouvoir utiliser les évènements du container
}
//# sourceMappingURL=app.js.map