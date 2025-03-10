let isRecording = false;
let recognition;
let shouldCapitalize = true;

const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],  // Formatação de texto
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],  // Listas
            [{ 'align': '' }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],  // Alinhamento
            ['link', 'image'],  // Links e Imagens
            [{ 'color': [] }, { 'background': [] }],  // Cor do texto e fundo
            ['blockquote', 'code-block'],  // Citação e Bloco de Código
            [{ 'font': [] }, { 'size': [] }],  // Fontes e Tamanho
            ['clean'], // Limpar formatação
        ]
    },
    placeholder: 'Comece a digitar ou use o reconhecimento de voz....'
});

const modalQuill = new Quill('#modal-editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],  // Formatação de texto
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],  // Listas
            [{ 'align': '' }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],  // Alinhamento
            ['link', 'image'],  // Links e Imagens
            [{ 'color': [] }, { 'background': [] }],  // Cor do texto e fundo
            ['blockquote', 'code-block'],  // Citação e Bloco de Código
            [{ 'font': [] }, { 'size': [] }],  // Fontes e Tamanho
            ['clean'], // Limpar formatação
        ]
    },
    placeholder: 'Digite o conteúdo do auto texto....'
});

// Funções de gerenciamento de documentos (substituindo localStorage por backend)
async function getDocumentsFromBackend() {
    try {
        const response = await fetch('/autotext');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao carregar documentos:', error);
        return [];
    }
}

async function saveDocumentToBackend(name, content) {
    try {
        const response = await fetch('/autotext', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, content })
        });
        const result = await response.json();
        if (result.message) {
            alert(result.message);
            updateDocumentList();
        }
    } catch (error) {
        console.error('Erro ao salvar documento:', error);
    }
}

async function deleteDocumentFromBackend(id) {
    try {
        const response = await fetch(`/autotext/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.message) {
            alert(result.message);
            updateDocumentList();
        }
    } catch (error) {
        console.error('Erro ao excluir documento:', error);
    }
}

async function updateDocumentList() {
    try {
        const documents = await getDocumentsFromBackend();
        const documentList = document.getElementById('documents-ul');
        documentList.innerHTML = '';
        documents.forEach(doc => {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.textContent = doc.name;
            li.addEventListener('click', () => openDocumentForEditing(doc._id));
            documentList.appendChild(li);
        });
    } catch (error) {
        console.error('Erro ao atualizar lista de documentos:', error);
    }
}

async function openDocumentForEditing(id) {
    try {
        const response = await fetch(`/autotext/${id}`);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        
        // Preencha o campo "documentName" com o nome do documento
        document.getElementById('documentName').value = data.name;
        
        // Preencha o editor com o conteúdo do documento
        modalQuill.root.innerHTML = data.content;
        
        // Armazene o ID do documento no formulário para uso posterior
        document.getElementById('autoTextoForm').dataset.id = id;
        
        // Mostre o botão "Excluir"
        document.getElementById('deleteDocumentBtn').style.display = 'inline-block';
        
        // Abra o modal
        new bootstrap.Modal(document.getElementById('autoTextoModal')).show();
    } catch (error) {
        console.error('Erro ao abrir documento para edição:', error);
        alert('Erro ao carregar o documento. Verifique o console para mais detalhes.');
    }
}

function openModalForNewDocument() {
    document.getElementById('documentName').value = '';
    modalQuill.root.innerHTML = '';
    document.getElementById('deleteDocumentBtn').style.display = 'none';
    delete document.getElementById('autoTextoForm').dataset.id; // Remover o ID do formulário
    new bootstrap.Modal(document.getElementById('autoTextoModal')).show();
}

async function loadDocument(docName) {
    try {
        console.log(`Buscando documento: ${docName}`); // Log para depuração

        const response = await fetch(`/autotext/by-name?name=${encodeURIComponent(docName)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Adicione o token de autenticação
            }
        });

        console.log('Resposta do servidor:', response); // Log para depuração

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Resposta do backend:', data); // Log para depuração

        if (data.content) {
            const range = quill.getSelection();
            const index = range ? range.index : quill.getLength();
            quill.clipboard.dangerouslyPasteHTML(index, data.content);
            quill.setSelection(index + data.content.length);
        } else {
            console.log(`Documento com nome "${docName}" não encontrado`);
            alert(`Documento "${docName}" não encontrado!`);
        }
    } catch (error) {
        console.error('Erro ao carregar documento:', error);
        alert('Erro ao carregar o documento. Verifique o console para mais detalhes.');
    }
}
// Eventos
document.getElementById('mascaras-link').addEventListener('click', (e) => {
    e.preventDefault();
    openModalForNewDocument();
});

document.getElementById('saveDocumentBtn').addEventListener('click', async (e) => {
    e.preventDefault(); // Evita o comportamento padrão do formulário
    console.log('Botão Salvar clicado'); // Log para depuração

    const docName = document.getElementById('documentName').value.trim();
    const content = modalQuill.root.innerHTML;
    const id = document.getElementById('autoTextoForm').dataset.id || null;

    if (docName && content) {
        const data = {
            id: id, // Envie o ID apenas se estiver editando
            name: docName, // Envie o nome do documento
            content: content // Envie o conteúdo do documento
        };

        const response = await fetch('/autotext', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            // Fechar o modal e atualizar a lista de auto textos
            bootstrap.Modal.getInstance(document.getElementById('autoTextoModal')).hide();
            updateDocumentList();
        } else {
            alert('Erro ao salvar auto texto.');
        }
    } else {
        alert('Preencha nome e conteúdo.');
    }
});
document.getElementById('deleteDocumentBtn').addEventListener('click', async () => {
    const id = document.getElementById('autoTextoForm').dataset.id;
    if (confirm('Tem certeza que deseja excluir este auto texto?')) {
        await deleteDocumentFromBackend(id);
        bootstrap.Modal.getInstance(document.getElementById('autoTextoModal')).hide();
    }
});

document.getElementById('toggle-documents-btn').addEventListener('click', () => {
    const docList = document.getElementById('documents-ul');
    const title = document.getElementById('document-list-title');
    if (docList.style.display === 'none') {
        docList.style.display = 'block';
        document.getElementById('toggle-documents-btn').textContent = 'Ocultar';
        title.textContent = 'Auto Texto';
        title.classList.add('visivel');
        title.classList.remove('oculto');
    } else {
        docList.style.display = 'none';
        document.getElementById('toggle-documents-btn').textContent = 'Mostrar';
        title.textContent = 'Auto Texto (Ocultos)';
        title.classList.add('oculto');
        title.classList.remove('visivel');
    }
});

document.getElementById('record-btn').addEventListener('click', toggleRecording);

document.getElementById('change-color').addEventListener('click', () => document.getElementById('color-picker').click());
document.getElementById('color-picker').addEventListener('input', (e) => quill.root.style.backgroundColor = e.target.value);

// Reconhecimento de voz
function toggleRecording() {
    if (!isRecording) {
        iniciarGravacao();
        isRecording = true;
        document.getElementById('record-btn').innerHTML = '<img src="./assets/img/pausar.png" alt="Pausar" width="30">';
    } else {
        pararGravacao();
        isRecording = false;
        document.getElementById('record-btn').innerHTML = '<img src="./assets/img/icone.png" alt="Gravar" width="30">';
    }
}

function iniciarGravacao() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Seu navegador não suporta reconhecimento de voz.');
        return;
    }
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onresult = function(event) {
        let transcript = '';
        let newLine = false;
        let newParagraph = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                let currentTranscript = event.results[i][0].transcript.trim().toLowerCase();

                if (currentTranscript.includes("ponto")) {
                    console.log('Ponto detectado');
                    setTimeout(aplicarCorrecaoNoEditor, 500);
                }
                if (currentTranscript.includes("vírgula")) {
                    console.log('Vírgula detectada');
                    setTimeout(aplicarCorrecaoNoEditor, 500);
                }
                
                if (currentTranscript.includes("=?")) {
                    console.log('Ponto detectado');
                    setTimeout(aplicarCorrecaoNoEditor, 500);
                }

                currentTranscript = currentTranscript.replace(/\.$/, ' ');

                if (currentTranscript.includes("nova linha")) {
                    newLine = true;
                    currentTranscript = currentTranscript.replace(/nova linha/gi, '');
                    
                    // Capitalizar a primeira letra da transcrição
                    currentTranscript = currentTranscript.charAt(0).toUpperCase() + currentTranscript.slice(1);
                }

                if (currentTranscript.includes("ponto parágrafo")) {
                    newParagraph = true;
                    shouldCapitalize = true;
                    currentTranscript = currentTranscript.replace(/ponto parágrafo/gi, '');
                }

                const match = currentTranscript.match(/^auto\s*texto\s*([\w\s]+)/i);
                if (match) {
                    const docName = normalizeText(match[1]);
                    loadDocument(docName);
                } else {
                    currentTranscript = replaceWords(applySubstitutions(currentTranscript));

                    if (shouldCapitalize && currentTranscript.length > 0) {
                        currentTranscript = currentTranscript.charAt(0).toUpperCase() + currentTranscript.slice(1);
                        shouldCapitalize = false;
                    }
                    transcript += currentTranscript + ' ';
                }
            }
        }

        if (transcript.trim() || newLine || newParagraph) {
            let range = quill.getSelection();
            let index = range ? range.index : quill.getLength();
            if (transcript.trim()) {
                quill.insertText(index, transcript, 'user');
                index += transcript.length;
            }
            if (newLine) {
                quill.insertText(index++, '\n', 'user');
                shouldCapitalize = true; // Ativar capitalização para a próxima palavra
            }
            if (newParagraph) {
                quill.insertText(index, '\n\n', 'user');
                index += 2;
                shouldCapitalize = true; // Ativar capitalização para a próxima palavra
            }
            quill.setSelection(index);
        }
    };

    recognition.onend = () => shouldCapitalize = true;
    recognition.start();
}

function pararGravacao() {
    if (recognition) recognition.stop();
}



function replaceWords(text) {
    return applySubstitutions(text);
}

function corrigirEspacosAntesDePontos(texto) {
    return texto.replace(/(\w+)\s+([.,])/g, "$1$2");
}

function removerInterrogacaoIgual(texto) {
    // Remover "? " após o sinal de igual
    return texto.replace(/=\s*\?/g, "=");
}

function aplicarCorrecaoNoEditor() {
    const range = quill.getSelection();
    const cursorPosition = range ? range.index : quill.getLength();
    let textoAtual = quill.getText();
    
    // Aplica ambas as correções
    textoAtual = corrigirEspacosAntesDePontos(textoAtual);
    textoAtual = removerInterrogacaoIgual(textoAtual);
    
    quill.setText(textoAtual);
    quill.setSelection(cursorPosition);
}