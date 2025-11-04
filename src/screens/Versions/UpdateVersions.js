import { useEffect, useRef, useState } from 'react';
import EntriesMap from '../../components/Curriculum/EntriesMap';
import CurriculumService from '../../services/CurriculumService';
import './UpdateVersions.css';
import LoadingComp from '../../components/Extra/LoadingComp';
import { spinnerOnRequest } from '../../components/Extra/Utils';

import imgComeBack from '../../assets/images/ComeBack.svg';
import imgReceiptSent from '../../assets/images/Proven.svg';
import imgSave from '../../assets/images/Save.svg';
import imgWaitingSave from '../../assets/images/Waiting.svg';
import imgWithoutRceipt from '../../assets/images/WithoutProof.svg';
import imgNewVersion from '../../assets/images/createNewCurriculum.svg';
import imgIconUpReceipt from '../../assets/images/uploadReceipt.svg';

import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'reactstrap';
import CardReceipt, { WAITING_SAVE } from '../../components/Curriculum/CardReceipt';
import PopupSpace from '../../components/FormGroup/PopupSpace';
import LeftMenu from '../../components/Menu/LeftMenu';

import { showErrorMessage, showSuccessMessage, showWarningMessage } from "../../components/Toastr/Toastr";

// Serviços
const service = CurriculumService;

const updateFilesType = '.jpeg, .jpg, .png, .pdf';
const maxReceipts = 3;
const maxSizeMB = 3 * 1024 * 1024;

export default function UpdateVersions() {

    const navigate = useNavigate();
    const { id: idParam } = useParams();

    // Estados
    // O setState do react é assíncrono, mas só mostra o valor atualizado após nova renderização
    const [curriculum, setCurriculum] = useState({
        entryCount: 0,
        ownerName: '',
        ownerId: 0,
        description: '',
        version: '',
        entryList: [],
        lastModification: ''
    });

    const [currentEntry, setCurrentEntry] = useState(null);
    const [receiptList, setReceiptList] = useState([]);

    const [newReceiptsFiles, setNewReceiptsFiles] = useState([]);

    const [renderPopupCommentaryVersion, setRenderPopupCommentaryVersion] = useState(false);
    const [commentaryToNewVersion, setCommentaryToNewVersion] = useState("");

    const [focusCurrentEntry, setFocusCurrentEntry] = useState(null);

    const [renderPopupImportReceipt, setRenderPopupImportReceipt] = useState(false);
    const [renderPopupInformUrl, setRenderPopupInformUrl] = useState(false);

    const [currentLink, setCurrentLink] = useState("");
    const [currentReceiptFile, setCurrentReceiptFile] = useState(null);
    const [currentReceiptCommentary, setCurrentReceiptCommentary] = useState("");

    const [anyOriginalRemoved, setAnyOriginalRemoved] = useState(false);
    const [haveAllOriginalReceipts, setHaveAllOriginalReceipts] = useState(true);

    const [countId, setCountId] = useState(0);

    const [loading, setLoading] = useState(false);

    // Refs para botões
    const btnFisicalReceipt = useRef(null);
    const btnLinkReceipt = useRef(null);
    const btnUpdate = useRef(null);
    // Ref para que botão chame componente de input de arquivo
    const fileInputRef = useRef(null);

    // Ref para prevenção de carregamento de página
    const preventLoad = useRef({ haveAllOriginalReceipts, anyOriginalRemoved });

    // Busca dados no mount e quando id muda
    useEffect(() => {
        async function findById() {
            try {
                const response = await spinnerOnRequest(() => service.findById(idParam), setLoading);
                setCurriculum(response.data);
            } catch (error) {
                console.error(error);
            }

            if (btnFisicalReceipt.current) btnFisicalReceipt.current.disabled = true;
            if (btnLinkReceipt.current) btnLinkReceipt.current.disabled = true;
            if (btnUpdate.current) btnUpdate.current.disabled = true;
        }
        findById()
    }, [idParam]);

    /*
    * Verificação de comprovantes não salvos - Parte 02
    */
    const loadListener = {
        name: 'beforeunload',
        handleBeforeUnload: (event) => {
            const { haveAllOriginalReceipts: originals, anyOriginalRemoved: originalRemoved } = preventLoad.current;
            if (!originals || originalRemoved) {
                // se houver algum novo, ou se algum original do banco de dados foi removido
                event.preventDefault();
                event.returnValue = "";
                return "";
            }
        }
    }

    useEffect(() => {

        // atualiza variáveis a serem usadas no useRef
        preventLoad.current = { haveAllOriginalReceipts, anyOriginalRemoved };

        // adiciona o evento de prevenção de navegação
        window.addEventListener(loadListener.name, loadListener.handleBeforeUnload);

        // Função de Limpeza do useEfect
        // remoção para prevenir vazamentos de memória
        return () => window.removeEventListener(loadListener.name, loadListener.handleBeforeUnload);

    }, [haveAllOriginalReceipts, anyOriginalRemoved]);



    // Verifica quantidade de comprovantes e habilita/desabilita botões
    useEffect(() => {
        // Ao carregar a página não há entrada/competência selecionada, logo não analisa comprovantes
        if (currentEntry) {

            const numbReceipts = receiptList.length;

            if (btnFisicalReceipt.current && btnLinkReceipt.current) {
                if (numbReceipts <= maxReceipts) {
                    btnFisicalReceipt.current.disabled = false;
                    btnLinkReceipt.current.disabled = false;
                    if (numbReceipts === 0) {
                        showWarningMessage("A entrada ainda não possui comprovantes! Os envie clicando em uma das opções abaixo!");
                    }
                } else {
                    // máximo de 5 comprovantes
                    btnFisicalReceipt.current.disabled = true;
                    btnLinkReceipt.current.disabled = true;
                }
            };
        }
    }, [receiptList]);

    // alerta de navegador
    const handleBack = () => {
        if (!haveAllOriginalReceipts || anyOriginalRemoved) {
            if (window.confirm('Você enviou novos comprovantes que ainda não foram salvos. \nDeseja mesmo sair?')) {
                navigate('/versionlisting');
            }
        } else {
            navigate('/versionlisting');
        }
    }

    // Mostrar comprovantes e manipulação botões
    // realiza alterações apenas se a competência já não estiver selecionada
    // parâmetro receipts é recebido de componente EntriesMap
    const showReceipts = async (receipts, element) => {
        if (currentEntry != element) {
            setCurrentEntry(element);
            emphasis(element);
            setReceiptList(receipts);
        }
    };

    // Adiciona destaque na entry clicada
    const emphasis = (element) => {
        if (focusCurrentEntry !== null) {
            focusCurrentEntry.classList.remove('Emphasis');
        }
        element.classList.add('Emphasis');
        setFocusCurrentEntry(element);
    };

    // Atualiza o currículo com dados e comprovantes novos
    const updateCurriculum = async (isNewVersion = false) => {
        try {

            // DTO
            const curriculumToSend = structuredClone(curriculum);
            // renovar ids de receipts e respectivos arquivos para inteiro
            curriculumToSend.entryList.forEach(entry => {
                let count = 1;
                let newId;
                entry.receipts.forEach(rec => {
                    if (String(rec.id).includes('new')) {
                        // se novo prepara novo id tipo int
                        newId = entry.id + count++;
                        // busca nos arquivos a serem enviados por correspondência
                        newReceiptsFiles.forEach(file => {
                            if (file.id === rec.id) {
                                // file recebe novo ID
                                file.id = -(newId);
                            }
                        })
                        // receipt recebe novo ID
                        rec.id = -(newId);
                    }
                })
            });

            const data = new FormData();
            // se nova versão
            if (isNewVersion) {
                data.append('newversion', true);
                curriculumToSend.description = commentaryToNewVersion;
            }
            // files[] ids[]
            newReceiptsFiles.forEach(rec => {
                data.append('files', rec.file);
                data.append('fileIds', rec.id);
            });
            // curriculumDto
            data.append(
                'dto',
                new Blob([JSON.stringify(curriculumToSend)], { type: 'application/json' })
            );

            const responseData = (await spinnerOnRequest(() => service.update(data), setLoading)).data;

            // remove restrição de load de página
            window.removeEventListener(loadListener.name, loadListener.handleBeforeUnload);
            alert('A página será recarregada!');
            if (isNewVersion) {
                navigate(`/updateversions/${responseData.id}`);
            } else {
                window.location.reload();
            }

        } catch (error) {
            console.log(error);
            showErrorMessage('Ocorreu um erro ao tentar atualizar o currículo.');
        }
    };

    // Salva nova versão do currículo
    const saveNewVersion = async () => {

        await updateCurriculum(true);

        // fecha popup e reinicia variáveis
        cancelSaveNewVersion();

        showSuccessMessage('Carregada nova versão criada!');
    };

    // Cancela salvar nova versão
    const cancelSaveNewVersion = () => {
        setRenderPopupCommentaryVersion(false);
        setCommentaryToNewVersion("");
    };

    // Adiciona comprovante (link/físico)
    const addReceipt = async () => {
        await addNewReceipt();
        closePopups();
        setHaveAllOriginalReceipts(false);
    };

    const addNewReceipt = async () => {

        let newReceipt = {
            id: generateId(),
            commentary: currentReceiptCommentary,
            status: WAITING_SAVE
        }

        if (currentLink === "") {
            // se comprovante físico

            const nameFile = currentReceiptFile.name;
            const indexDot = nameFile.indexOf(".");

            newReceipt.name = nameFile.substring(0, indexDot);
            newReceipt.extension = nameFile.substring(indexDot);

            // para vincular no back com entidade receipt
            const fileWithId = { id: newReceipt.id, file: currentReceiptFile }
            setNewReceiptsFiles(prev => [...prev, fileWithId]);
        } else {
            newReceipt.url = currentLink
        }


        // adiciona na lista de comprovantes do currículo original
        setCurriculum(prev => ({
            ...prev,
            entryList: prev.entryList.map(entry => {
                if (entry.id == currentEntry.id) {

                    // cria nova lista visualização de comprovantes
                    const newRecList = [...entry.receipts, newReceipt];

                    // mostra lista ao usuário usando área destinada aos comprovantes da comp. destacada
                    setReceiptList(newRecList);

                    // retorna com 1 comprovante a mais
                    return {
                        ...entry,
                        receipts: newRecList
                    };
                } else {
                    // retorna original
                    return entry;
                }
            })
        }));
    };

    // gerar ID para novos comprovantes
    const generateId = () => {
        // novos comprovantes possuem ID terminando com ID da entrada/competência + tamanho da lista atual
        setCountId(countId + 1);
        // useState leva 1 renderização para atualizar valores, por isso abaixo está somado a 1.
        return `new${currentEntry.id}${countId + 1}`;
    }

    // Fecha o popup
    const closePopups = () => {
        // link
        setRenderPopupInformUrl(false);
        setCurrentLink("");
        // físico
        setRenderPopupImportReceipt(false);
        setCurrentReceiptFile(null);

        setCurrentReceiptCommentary("");
    };

    // Remove comprovante da lista
    const deleteReceipOfList = async (id, isFisicalFile) => {

        let countNewReceipts = 0;

        setCurriculum(prev => ({
            ...prev,

            // lista de competências
            entryList: prev.entryList.map(entry => {
                // se forem removidos comprovantes novos, verifica quantidade
                if (String(id).includes('new')) {
                    entry.receipts.forEach(rec => {
                        if (String(rec.id).includes('new')) countNewReceipts++;
                    });

                }

                if (entry.id == currentEntry.id) {
                    // retornar todos os dados da entrada + lista de comprovantes atualizada
                    const receiptsListAfterRemove = entry.receipts.filter(rec => rec.id !== id);

                    // seta para visualização em tela
                    setReceiptList(receiptsListAfterRemove);

                    // retorna cópia de objeto para melhor prática usando react
                    return ({
                        ...entry,
                        receipts: receiptsListAfterRemove
                    })
                } else {
                    return entry;
                }
            })
        }));

        if (String(id).includes('new')) {
            // removido comprovante recém adicionado
            // se o removido era o único novo e nenhum original foi removido, então restaram apenas os originais
            setHaveAllOriginalReceipts(countNewReceipts === 1 && !anyOriginalRemoved);

            if (isFisicalFile) {
                // se arquivo físico
                setNewReceiptsFiles(prev => prev.filter(file => file.id !== id));
            }
        } else {
            // removido comprovante persistido no banco
            setAnyOriginalRemoved(true);
            setHaveAllOriginalReceipts(false);
        }

    };

    // Atualiza arquivo atual para upload
    const setCurrentFile = (file) => {
        if (file != null) {
            if(file.size > maxSizeMB) {
                showErrorMessage('Tamanho máximo de 3MB excedido.');
            } else {
                setCurrentReceiptFile(file);
            }
        }
    };

    return (
        <div className='F-update'>

            <LoadingComp render={loading}/>

            <div className='Div-Menu'>
                <LeftMenu />
            </div>

            <div className='Div-Content'>

                <div className='First-Line'>
                    <div className='Name-and-entries'>
                        <h2 id='nameCurriculumOwner'>{curriculum.ownerName}</h2>
                        <h4 id='countEntry'>Competências identificadas: {curriculum.entryCount}</h4>
                        <br />
                    </div>
                    <div className='Version-and-comment'>
                        <h2 id='versionCurriculum'>{curriculum.version}</h2>
                        <h4 id='descriptionCurriculum'>{curriculum.description}</h4>
                    </div>
                </div>

                <div className='Secound-Line'>

                    <div className='Save-return-buttons'>
                        <Button
                            id='buttonComeBack'
                            onClick={handleBack}
                            color="primary"
                            size="lg"
                            className="Bt-space-between"
                            title='listagem de versões'
                        ><img id="ico-comeBack" className="Button-ComeBack Bt-size1-updateC" border="0" src={imgComeBack} />
                        </Button>

                        <Button
                            id='buttonUpdate'
                            color="primary"
                            size="lg"
                            className="Bt-space-between"
                            onClick={() => updateCurriculum()}
                            innerRef={el => (btnUpdate.current = el)}
                            title='atualizar versão'
                            disabled={haveAllOriginalReceipts}
                        ><img className="Button-Save Bt-size1-updateC Current-version" border="0" src={imgSave} />
                        </Button>

                        <Button
                            id='buttonNewVersion'
                            color="primary"
                            size="lg"
                            className="Save Save-new-version"
                            onClick={() => setRenderPopupCommentaryVersion(true)}
                            title='salvar nova versão'
                        ><img className="Button-Save Bt-size1-updateC New-version" border="0" src={imgNewVersion} alt="Nova Versão" />
                        </Button>
                    </div>

                    <div className='Receipts-Buttons'>
                        <Button
                            id='butonAuthValidator'
                            color="primary"
                            size="lg"
                            className="Validator-authentication"
                            innerRef={el => (btnFisicalReceipt.current = el)}
                            onClick={() => setRenderPopupImportReceipt(true)}
                        > (+) COMPROVANTE FÍSICO </Button>
                        <Button
                            id='buttonAuthEletronic'
                            color="primary"
                            size="lg"
                            className="Electronic-authentication"
                            innerRef={el => (btnLinkReceipt.current = el)}
                            onClick={() => setRenderPopupInformUrl(true)}
                        > (+) COMPROVANTE VIA LINK </Button>
                    </div>
                </div>

                <div className='Third-Line'>

                    <div className="Box-Experiences">
                        <h2>Competências por grupo</h2>
                        <br />
                        {/* Competências identificadas */}
                        <EntriesMap entries={curriculum.entryList} loadReceipts={showReceipts} />
                    </div>

                    <div className='Entry-Receipts'>
                        <CardReceipt
                            receipts={receiptList}
                            deleteMethod={deleteReceipOfList}
                        />
                    </div>
                </div>

                {/* Popup para envio de arquivo físico */}
                <PopupSpace render={renderPopupImportReceipt}>
                    <h2 className='Center'>Upload de Arquivo</h2>
                    <div className='In-line'>
                        <h3>Arquivo:</h3>
                        <input type='text' disabled={true} className='Input-arquive' placeholder={currentReceiptFile ? currentReceiptFile.name : '***'} />
                        <input
                            type='file'
                            accept={updateFilesType}
                            className='Input-hiden'
                            ref={fileInputRef}
                            onChange={e => setCurrentFile(e.target.files[0])}
                        />
                        <Button
                            id='buttonSendFisicalReceipt'
                            color="primary"
                            size="sm"
                            className="Bt-import-Receipt"
                            onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        ><img className="Icon" border="0" src={imgIconUpReceipt} alt="Enviar arquivo" /><b>ENVIAR</b>
                        </Button>
                    </div>
                    <div className='In-line'>
                        <h3>Comentário:</h3>
                        <input
                            type='text'
                            className='Input-commentary'
                            placeholder='(opcional)'
                            onChange={e => setCurrentReceiptCommentary(e.target.value.trim())}
                        />
                    </div>
                    <div className='Buttons-confirm-cancel-receipt'>
                        <Button
                            id='buttonAddFisicalReceipt'
                            color="primary"
                            size="lg"
                            disabled={currentReceiptFile == null}
                            onClick={addReceipt}
                        ><b>ADICIONAR COMP</b>
                        </Button>

                        <Button id='buttonCancelSendFisicalReceipt' color="danger" size="lg" onClick={closePopups}>
                            <b>CANCELAR</b>
                        </Button>
                    </div>
                </PopupSpace>

                {/* Popup para adicionar comprovante via link */}
                <PopupSpace render={renderPopupInformUrl}>
                    <h2 className='Center'>Link de Comprovante</h2>
                    <div className='InputsLink'>
                        <h3>Informe o link:</h3>
                        <textarea
                            className='Paragraph-field'
                            autoFocus={true}
                            onChange={e => setCurrentLink(e.target.value.trim())}
                        />
                        <br />
                        <h3>Comentário:</h3>
                        <input
                            type='text'
                            className='Commentary'
                            placeholder='(opcional)'
                            onChange={e => setCurrentReceiptCommentary(e.target.value.trim())}
                        />
                    </div>

                    <div className='Buttons-link'>
                        <Button id='btn-add-receipt-link' color="primary" size="lg" disabled={currentLink === ""} onClick={addReceipt}>
                            <b>ADICIONAR COMP</b>
                        </Button>

                        <Button id='btn-cancel-receipt-link' color="danger" size="lg" onClick={closePopups}>
                            <b>CANCELAR</b>
                        </Button>
                    </div>
                </PopupSpace>

                {/* Popup para adicionar comentário na nova versão */}
                <PopupSpace render={renderPopupCommentaryVersion}>
                    <h2 className='Center'>Salvar nova versão do currículo</h2>
                    <div className='InputsLink'>
                        <h3>Adicione um comentário:</h3>
                        <input
                            type='text'
                            className='Commentary'
                            autoFocus={true}
                            placeholder='(requisitado)'
                            onChange={e => setCommentaryToNewVersion(e.target.value.trim())}
                        />
                    </div>
                    <br /><br /><br />
                    <div className='Buttons-link'>
                        <Button
                            id='buttonSaveNewVersion'
                            color="primary"
                            size="lg"
                            disabled={commentaryToNewVersion === ""}
                            onClick={saveNewVersion}
                        ><b>SALVAR</b>
                        </Button>

                        <Button id='buttonCancelSaveNewVersion' color="danger" size="lg" onClick={cancelSaveNewVersion}>
                            <b>CANCELAR</b>
                        </Button>
                    </div>
                </PopupSpace>

                <div className='Bottom-icons'>
                    <div className='Icons-flex'>
                        <img src={imgWithoutRceipt} />
                        <h6>Sem comprovante</h6>
                    </div>
                    <div className='Icons-flex'>
                        <img src={imgReceiptSent} />
                        <h6>Comprovante enviado</h6>
                    </div>
                    <div className='Icons-flex'>
                        <img src={imgWaitingSave} />
                        <h6>Aguardando para salvar</h6>
                    </div>
                </div>

            </div>
        </div>
    );
}