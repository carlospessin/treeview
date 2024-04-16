var root         = document.documentElement,
    toolBar      = document.querySelector('[role="toolbar"]'),
    // colorInput   = document.querySelector('#line-color'),
    // lineInput    = document.querySelector('#line-width'),
    // gutterInput  = document.querySelector('#gutter'),
    alertRoot    = document.querySelector('[data-js="deleteNode"] .root'),
    alertConfirm = document.querySelector('[data-js="deleteNode"] .confirm'),
    colorButtons = document.querySelectorAll('#node-color .color');
    
// All the button and body clicks are intercepted here.
document.addEventListener('click', function (e) {
  var clickType = e.target.getAttribute('data-js');
  // User has selected a node
  if (clickType === 'node') {
    selectNode(e);
  } else if (clickType !== '' && clickType !== null) {
    // Buttons within the toolbar, at the top of the page
    if      (clickType === 'promoteSibling') promoteSibling();
    else if (clickType === 'demoteSibling')  demoteSibling();
    else if (clickType === 'editName')       editName();
    else if (clickType === 'deleteNode')     deleteNode(e);
    else if (clickType === 'addChild')       addChild();
  } else {
    // User has clicked outside of a node
    deselectNodes();
    hideToolbar();
  }
});

// Customise views events
// colorInput.addEventListener('change', lineColor);
// lineInput.addEventListener('change', lineWidth);
// gutterInput.addEventListener('change', gutterWidth);

function changeNodeColor(e) {
    var selectedNode = document.querySelector('.tree .selected');
    if (selectedNode) {
        var newColor = e.target.style.backgroundColor;
        selectedNode.style.backgroundColor = newColor;
    }
}

for (var i = 0; i < colorButtons.length; i++) {
colorButtons[i].addEventListener('click', changeNodeColor);
}

function lineColor(e) {
  root.style.setProperty('--line-color', e.target.value);
}
function lineWidth(e) {
  root.style.setProperty('--line-width', (e.target.value / 10) + 'em');
}
function gutterWidth(e) {
  root.style.setProperty('--gutter', (e.target.value / 10) + 'em');
}

// Allows the user to reorder the tree with the keyboard
root.addEventListener('keydown', function (e) {
  var keyPress;
  // New method vs. old method
  if (e.key) keyPress = e.key;
  else       keyPress = e.which;
  // If the user is editing a node name, they might need to use the arrow keys As God Intended
  if (e.target.getAttribute('contenteditable')) {
    if (keyPress === ' ' || keyPress === '32') {
      insertTextAtCursor(' ');
    }
  } else {
    if (keyPress === 'ArrowRight' || keyPress === '37') {
      demoteSibling();
    } else if (keyPress === 'ArrowLeft' || keyPress === '39') {
      promoteSibling();
    }
  }
  // This is useful whether the user is editing the button or not
  if (keyPress === 'ArrowDown' || keyPress === '40') {
    addChild();
  }
});

// Deselects all other nodes, selects the current node and hoyks in the toolber
function selectNode(e) {
  var clicker = e.target;
  // Hang on - do we need to do anything?
  if (clicker.getAttribute('aria-pressed') === 'false') {
    deselectNodes();
    clicker.setAttribute('aria-pressed', 'true');
    clicker.classList.add('selected');
    showToolbar();   
  }
}

// Bit of cleanup, after the user has finished editing the tree.
function deselectNodes() {
  // This needs to run from scratch as new nodes might have been added
  var selectedBtns = [...document.querySelectorAll('.tree [aria-pressed="true"]')],
      btnDelete = document.querySelector('[data-js="deleteNode"]'),
      editBtns = [...document.querySelectorAll('.tree [contenteditable]')];
  // I mean, in theory, there should only be one selected button, but, you know, bugs...
  for (var i = 0; i < selectedBtns.length; i++) {
    selectedBtns[i].setAttribute('aria-pressed', 'false');
    selectedBtns[i].classList.remove('selected');
  }
  // Bit of cleanup, in case the user noped out of deleting a node
  if (btnDelete.classList.contains('js-confirm')) {
    btnDelete.classList.remove('js-confirm');
    alertConfirm.setAttribute('aria-hidden','true');
  }
  if (btnDelete.classList.contains('js-root')) {
    btnDelete.classList.remove('js-root');
    alertRoot.setAttribute('aria-hidden','true');
  }
  // Checks for new nodes which are editable, then turns them off.
  for (var i = 0; i < editBtns.length; i++) {
    editBtns[i].removeAttribute('contenteditable');
  }
}

function showToolbar() {
  toolBar.removeAttribute('aria-hidden');
  toolBar.classList.add('show');
}

function hideToolbar() {
  toolBar.setAttribute('aria-hidden','true');
  toolBar.classList.remove('show');
}

// Moves the sibling to the left
function promoteSibling() {
  if (document.querySelector('.tree .selected')) {
    var favouriteChild = document.querySelector('.tree .selected').parentNode,
        elderChild = favouriteChild.previousElementSibling;
    // Does this selected element have anywhere to go?
    if (elderChild) {
      favouriteChild.parentNode.insertBefore(favouriteChild,elderChild);
    }    
  }
}

// Moves the sibling to the right
function demoteSibling() {
  if (document.querySelector('.tree .selected')) {
    var chosenChild = document.querySelector('.tree .selected').parentNode,
        youngerChild = chosenChild.nextElementSibling;
    // Does this selected element have anywhere to go?
    if (youngerChild) {
      chosenChild.parentNode.insertBefore(youngerChild,chosenChild);
    }    
  }
}

// Allows the user to rename existing nodes
function editName() {
  var chosenChild = document.querySelector('.tree .selected');
  chosenChild.setAttribute('contenteditable', 'true');
  chosenChild.focus();
}

// Removes the node and it's children
function deleteNode(e) {
  var chosenChild  = document.querySelector('.tree .selected'),
      delButton    = e.target,
      isRoot       = chosenChild.parentNode.parentNode.classList.contains('tree');
  
  // Is the user trying to delete the root node?
  if (isRoot) {
    delButton.classList.add('js-root');
    alertRoot.removeAttribute('aria-hidden');
  }
  // Has the user clicked the delete button once already?
  else if (delButton.classList.contains('js-confirm')) {
    // Is there more than one sibling?
    if (chosenChild.parentNode.parentNode.childElementCount > 1) {
      chosenChild.parentNode.remove();
    } else { // Remove the whole list
      chosenChild.parentNode.parentNode.remove();
    }
    deselectNodes();
    hideToolbar();
  } else {
    delButton.classList.add('js-confirm');
    alertConfirm.removeAttribute('aria-hidden');
  }
}

// Adds a new node under the current node
function addChild() {
  if (document.querySelector('.tree .selected')) {
    var chosenNode = document.querySelector('.tree .selected').parentNode,
        listItem = document.createElement('li');
    listItem.innerHTML = '<button type="button" aria-pressed="false" data-js="node" contenteditable="true"></button>';
    // The current node already has kids
    if (chosenNode.querySelector('ul')) {
      var chosenKids = chosenNode.querySelector('ul');
      chosenKids.appendChild(listItem);
      chosenKids.lastChild.querySelector('button').focus();
    } else { // The current node has no kids
      var newDad = document.createElement('ul');
      newDad.appendChild(listItem);
      chosenNode.appendChild(newDad);
      chosenNode.lastChild.querySelector('button').focus();
    }    
  }
}

// Because each node is a button tag, the space bar event is captured, when the user is editing.
// This is used as a work-around.
function insertTextAtCursor(text) {
    var sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode( document.createTextNode(text) );
        }
    } else if (document.selection && document.selection.createRange) {
        document.selection.createRange().text = text;
    }
}


// Função para gerar um objeto representando a estrutura da árvore
function generateTreeObject(element) {
  var children = [];
  var button = element.querySelector('button[data-js="node"]');
  if (button) {
    var ul = element.querySelector('ul');
    if (ul) {
      for (var i = 0; i < ul.children.length; i++) {
        children.push(generateTreeObject(ul.children[i]));
      }
    }
    return {
      id: button.id,
      name: button.textContent,
      color: button.style.backgroundColor,
      children: children
    };
  } else {
    return {
      children: children
    };
  }
}

// Função para baixar a estrutura da árvore como um arquivo JSON
function downloadTree() {
  var tree = document.querySelector('.tree');
  var treeObject = generateTreeObject(tree);

  // Verifique se a árvore não está vazia
  if (treeObject.children.length > 0) {
    var blob = new Blob([JSON.stringify(treeObject)], {type: 'application/json'});
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'tree.json';
    link.click();
  } else {
    alert('A árvore está vazia. Não há nada para baixar.');
  }
}

// Função para carregar a estrutura da árvore a partir de um arquivo JSON
function uploadTree(event) {
  var file = event.target.files[0];
  var reader = new FileReader();
  reader.onload = function(event) {
    var treeObject = JSON.parse(event.target.result);
    var tree = document.querySelector('.tree');
    tree.innerHTML = '';
    buildTree(treeObject, tree);
  };
  reader.readAsText(file);
}

// Função para construir a árvore a partir de um objeto
function buildTree(treeObject, element) {
  var button = document.createElement('button');
  button.id = treeObject.id;
  button.textContent = treeObject.name;
  button.style.backgroundColor = treeObject.color;
  button.setAttribute('data-js', 'node');
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('contenteditable', 'true');

  // Adicione o evento de duplo clique aqui
  button.addEventListener('dblclick', function(e) {
    e.target.setAttribute('contenteditable', 'true');
    e.target.focus();
  });

  element.appendChild(button);

  // Verifique se o nó tem filhos antes de criar um elemento ul
  if (treeObject.children.length > 0) {
    var ul = document.createElement('ul');
    element.appendChild(ul);
    for (var i = 0; i < treeObject.children.length; i++) {
      var li = document.createElement('li');
      buildTree(treeObject.children[i], li);
      ul.appendChild(li);
    }
  }
}

// Adicione event listeners para os botões de download e upload
document.querySelector('#download-button').addEventListener('click', downloadTree);
document.querySelector('#upload-input').addEventListener('click', function() {
  document.querySelector('#file-input').click();
});

document.querySelector('#file-input').addEventListener('change', uploadTree);



// Função para permitir a edição de um nó com um duplo clique
function enableNodeEditOnDblClick() {
  var nodes = document.querySelectorAll('[data-js="node"]');
  nodes.forEach(function(node) {
      node.addEventListener('dblclick', function(e) {
          e.target.setAttribute('contenteditable', 'true');
          e.target.focus();
      });
  });
}

// Chame a função após a definição
enableNodeEditOnDblClick();