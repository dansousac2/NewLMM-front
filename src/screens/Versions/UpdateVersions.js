import { useEffect, useRef, useState } from 'react';
import EntriesMap from '../../components/Curriculum/EntriesMap';
import FileUploadService from '../../services/FileUploadService';
import FileUploadWithoutClassCreationService from '../../services/FileUploadWithoutClassCreationService';
import ReceiptWithUrlService from '../../services/ReceiptWithUrlService';
import VersionService from '../../services/VersionsService';
import './UpdateVersions.css';

import img7 from '../../assets/images/ComeBack.svg';
import img11 from '../../assets/images/Invalidated.svg';
import img10 from '../../assets/images/Proven.svg';
import img12 from '../../assets/images/Save.svg';
import img9 from '../../assets/images/Waiting.svg';
import img8 from '../../assets/images/WithoutProof.svg';
import img13 from '../../assets/images/createNewCurriculum.svg';
import img14 from '../../assets/images/recyclebinEmpty.svg';
import iconUpReceipt from '../../assets/images/uploadReceipt.svg';

import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'reactstrap';
import CardReceipt from '../../components/Curriculum/CardReceipt';
import PopupSpace from '../../components/FormGroup/PopupSpace';
import LeftMenu from '../../components/Menu/LeftMenu';

import { showSuccessMessage, showWarningMessage } from "../../components/Toastr/Toastr";

// Serviços instanciados uma única vez
const service = VersionService;
const fileUploadService = FileUploadService();
const onlyFileUpload = FileUploadWithoutClassCreationService();
const receiptWithUrlService = ReceiptWithUrlService();


export default function UpdateVersions() {

    const navigate = useNavigate();

    const { id } = useParams();

    // Estados
    // O setState do react é assíncrono
    const [curriculumId, setCurriculumId] = useState("");
    const [entryCount, setEntryCount] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [ownerId, setOwnerId] = useState("");
    const [status, setStatus] = useState("");
    const [description, setDescription] = useState("");
    const [version, setVersion] = useState("");
    const [entryList, setEntryList] = useState([]);
    const [lastModification, setLastModification] = useState("");

    const [activeEntry, setActiveEntry] = useState(null);
    const [receiptList, setReceiptList] = useState([]);

    const [renderPopupImportReceipt, setRenderPopupImportReceipt] = useState(false);
    const [currentReceiptFile, setCurrentReceiptFile] = useState(null);
    const [currentReceiptFileName, setCurrentReceiptFileName] = useState("***");
    const [currentReceiptCommentary, setCurrentReceiptCommentary] = useState("");

    const [newReceiptsFiles, setNewReceiptsFiles] = useState([]);
    const [countNewReceipts, setCountNewReceipts] = useState(0);

    const [renderPopupInformUrl, setRenderPopupInformUrl] = useState(false);
    const [currentLink, setCurrentLink] = useState("");

    const [renderPopupCommentaryVersion, setRenderPopupCommentaryVersion] = useState(false);
    const [commentaryToNewVersion, setCommentaryToNewVersion] = useState("");

    const [haveAllOriginalReceipts, setHaveAllOriginalReceipts] = useState(true);

    const [updateCards, setUpdateCards] = useState(0);

    const [currentEntry, setCurrentEntry] = useState(null);

    // Refs para botões que manipulam "disabled"
    const buttAuthValidator = useRef(null);
    const buttAuthEletronic = useRef(null);
    const buttUpdate = useRef(null);

    // Ref para input file hidden
    const fileInputRef = useRef(null);

    // Busca dados no mount e quando id muda
    useEffect(() => {
        async function findById() {
            try {
                const response = await service.findById(id);
                const curriculum = response.data;
                setCurriculumId(curriculum.id);
                setEntryCount(curriculum.entryCount);
                setOwnerName(curriculum.ownerName);
                setOwnerId(curriculum.ownerId);
                setStatus(curriculum.status);
                setDescription(curriculum.description);
                setVersion(curriculum.version);
                setEntryList(curriculum.entryList);
                setLastModification(curriculum.lastModification);
            } catch (error) {
                console.error(error);
            }

            if (buttAuthValidator.current) buttAuthValidator.current.disabled = true;
            if (buttAuthEletronic.current) buttAuthEletronic.current.disabled = true;
            if (buttUpdate.current) buttUpdate.current.disabled = true;

            const handleBeforeUnload = (event) => {
                if (!haveAllOriginalReceipts || countNewReceipts > 0) {
                    event.preventDefault();
                    event.returnValue = "";
                    return "";
                }
            };

            window.addEventListener("beforeunload", handleBeforeUnload);
            return () => window.removeEventListener("beforeunload", handleBeforeUnload);
        }
        findById();
    }, [id]);

    // Verifica quantidade de comprovantes e habilita/desabilita botões
    useEffect(() => {
        // Ao carregar a página não entrada/competência selecionada, logo não analisa comprovantes
        if(currentEntry) {

            const numbReceipts = receiptList.length;
    
            if (buttAuthValidator.current && buttAuthEletronic.current) {
                if (numbReceipts === 5) {
                    // máximo de 5 comprovantes
                    buttAuthValidator.current.disabled = true;
                    buttAuthEletronic.current.disabled = true;
                } else if (numbReceipts === 0) {
                    buttAuthValidator.current.disabled = false;
                    buttAuthEletronic.current.disabled = false;
                    showWarningMessage("A entrada ainda não possui comprovantes! Os envie clicando em uma das opções abaixo!");
                }
            };
        }
    },[receiptList]);

    // Show receipts e manipulação botões
    // realiza alterações apenas se a competência já não estiver selecionada
    const showReceipts = async (receipts, element) => {
        if (currentEntry != element) {
            setCurrentEntry(element);

            setReceiptList(receipts);
            emphasis(element);
        }
    };

    // Adiciona destaque na entry clicada
    const emphasis = (element) => {
        if (activeEntry !== null) {
            activeEntry.classList.remove('Emphasis');
        }
        element.classList.add('Emphasis');
        setActiveEntry(element);
    };

    // Remove comprovante da lista
    const deleteReceipOfList = async (id, isFisicalFile) => {
        if (`${id}`.includes("new")) {
            if (isFisicalFile) {
                removeFromNewReceips(id);
            }
            countNewReceiptRemove();

            if (countNewReceipts - 1 <= 0 && haveAllOriginalReceipts) {
                if (buttUpdate.current) buttUpdate.current.disabled = true;
            }
        } else {
            setHaveAllOriginalReceipts(false);
            if (buttUpdate.current) buttUpdate.current.disabled = false;
        }

        await deleteOfEntry(id);
    };

    // Remove item do receiptList por id
    const deleteOfEntry = async (id) => {
        setReceiptList(prev => prev.filter(rec => rec.id !== id));
        setUpdateCards(prev => prev + 1);
    };

    // Remove arquivo novo da lista de arquivos
    const removeFromNewReceips = (id) => {
        setNewReceiptsFiles(prev => prev.filter(file => file.id !== id));
    };

    // Atualiza arquivo atual para upload
    const setCurrentFile = (file) => {
        if (file != null) {
            setCurrentReceiptFileName(file.name);
            setCurrentReceiptFile(file);
        }
    };

    // Cancela upload atual
    const cancelUploadReceipt = () => {
        setRenderPopupImportReceipt(false);
        setCurrentReceiptFile(null);
        setCurrentReceiptFileName("***");
        setCurrentReceiptCommentary("");
    };

    // Contadores para novos comprovantes
    const countNewReceiptAdd = () => {
        const count = countNewReceipts + 1;
        setCountNewReceipts(count);
        return count;
    };

    const countNewReceiptRemove = () => {
        setCountNewReceipts(prev => prev - 1);
    };

    // Adiciona novo comprovante
    const addNewReceipt = async () => {
        let receipt;

        if (currentLink === "") {
            const nameFile = currentReceiptFile.name;
            const indexDot = nameFile.indexOf(".");

            receipt = {
                id: `new${countNewReceiptAdd()}`,
                name: nameFile.substring(0, indexDot),
                extension: nameFile.substring(indexDot),
                commentary: currentReceiptCommentary,
                status: "WAITING_VALIDATION",
                url: null,
                lastModified: `${currentReceiptFile.lastModified}`,
            };

            currentReceiptFile.id = receipt.id;
            setNewReceiptsFiles(prev => [...prev, currentReceiptFile]);

        } else {
            receipt = {
                id: `new${countNewReceiptAdd()}`,
                commentary: currentReceiptCommentary,
                status: "WAITING_VALIDATION",
                url: currentLink,
            };
        }

        setReceiptList(prev => [...prev, receipt]);
        setUpdateCards(prev => prev + 1);
    };

    // Adiciona comprovante e atualiza estado
    const addReceiptAndUpdateListCard = async () => {
        await addNewReceipt();
        cancelUploadReceipt();
        if (buttUpdate.current) buttUpdate.current.disabled = false;
    };

    // Atualiza o currículo com dados e comprovantes novos
    const updateCurriculum = async () => {
        try {
            await this.saveNewReceiptsAndSetId();

            await this.service.update({
                id: this.state.id,
                ownerId: this.state.ownerId,
                lastModification: this.state.lastModification,
                description: this.state.description,
                entryCount: this.state.entryCount,
                entryList: this.state.entryList,
                version: this.state.version,
            });

            showSuccessMessage('Alterações salvas com sucesso! Atualizando página!');
            this.setState({ countNewReceipts: 0, haveAllOriginalReceipts: true });
            window.location.reload();

        } catch (error) {
            console.log(error);
        }
    };

    // Salva os comprovantes novos (arquivos ou links) e atualiza seus ids
    const saveNewReceiptsAndSetId = async () => {
        for (const entry of entryList) {
            for (const receipt of entry.receipts) {
                if (`${receipt.id}`.includes("new")) {
                    let idRec;

                    if (receipt.url === null) {
                        idRec = await sendFileToUserFolder(receipt);
                    } else {
                        idRec = await receiptWithUrlService.create(receipt).then(response => response.data);
                    }
                    receipt.id = idRec;
                }
            }
        }
    };

    // Envia arquivo físico para o servidor e retorna id
    const sendFileToUserFolder = async (receipt) => {
        const fileToSend = newReceiptsFiles.find(file => file.id === receipt.id);

        const data = new FormData();
        data.append('file', fileToSend);
        data.append('userId', ownerId);
        data.append('userCommentary', receipt.commentary);

        return fileUploadService.create(data)
            .then(response => response.data)
            .catch(error => {
                console.error(error);
            });
    };

    // Cancela o popup de adicionar link
    const cancelLinkAuth = () => {
        setRenderPopupInformUrl(false);
        setCurrentLink("");
        setCurrentReceiptCommentary("");
    };

    // Adiciona comprovante via link
    const addLinkReceipt = async () => {
        await addNewReceipt();
        cancelLinkAuth();
    };

    // Cancela salvar nova versão
    const cancelSaveNewVersion = () => {
        setRenderPopupCommentaryVersion(false);
        setCommentaryToNewVersion("");
    };

    // Salva nova versão do currículo
    const saveNewVersion = async () => {
        if (countNewReceipts > 0) {
            await removeIdOfNewReceips();
        }

        let idNewVersion = "";

        await service.create({
            id: curriculumId,
            ownerId,
            lastModification,
            description: commentaryToNewVersion,
            entryCount,
            entryList,
            version,
        }).then(response => {
            idNewVersion = response.data.id;
            if (newReceiptsFiles.length > 0) {
                onlySendNewFiles(response.data.entryList);
            }
        });

        showSuccessMessage("Nova versão salva com sucesso! Atualizando página para edição da nova versão!");
        setCountNewReceipts(0);
        setHaveAllOriginalReceipts(true);
        navigate(`/updateversions/${idNewVersion}`);
        window.location.reload();
    };

    // Remove ids dos comprovantes novos para salvar como novos
    const removeIdOfNewReceips = async () => {
        entryList.forEach(entry => {
            entry.receipts.forEach(rec => {
                if (`${rec.id}`.includes("new")) {
                    rec.id = null;
                }
            });
        });
    };

    // Envia apenas os arquivos novos após criar nova versão
    const onlySendNewFiles = async (entryListSaved) => {
        for (const file of newReceiptsFiles) {
            let wasFinded = false;

            for (const entry of entryListSaved) {
                for (const rec of entry.receipts) {
                    if (rec.lastModified === file.lastModified && `${rec.name}${rec.extension}` === file.name) {
                        const data = new FormData();
                        data.append('file', file);
                        data.append('userId', ownerId);
                        data.append('userCommentary', 'not used, but @valid stop the request whithout this');
                        data.append('nameOnDB', rec.id + rec.extension);

                        await onlyFileUpload.create(data);

                        wasFinded = true;
                        break;
                    }
                }
                if (wasFinded) break;
            }
        }
    };

    return (
        <div className='F-update'>

            <div className='Div-Menu'>
                <LeftMenu />
            </div>

            <div className='Div-Content'>

                <div className='First-Line'>
                    <div className='Name-and-entries'>
                        <h2 id='nameCurriculumOwner'>{ownerName}</h2>
                        <h4 id='countEntry'>Competências identificadas: {entryCount}</h4>
                        <br />
                    </div>
                    <div className='Version-and-comment'>
                        <h2 id='versionCurriculum'>{version}</h2>
                        <h4 id='descriptionCurriculum'>{description}</h4>
                    </div>
                </div>

                <div className='Secound-Line'>

                    <div className='Save-return-buttons'>
                        <Button
                            id='buttonComeBack'
                            onClick={() => navigate("/versionlisting")}
                            color="primary"
                            size="lg"
                            className="Bt-space-between"
                            title='listagem de versões'
                        ><img id="ico-comeBack" className="Button-ComeBack Bt-size1-updateC" border="0" src={img7} alt="Voltar" />
                        </Button>

                        <Button
                            id='buttonUpdate'
                            color="primary"
                            size="lg"
                            className="Bt-space-between"
                            const onClick={updateCurriculum}
                            innerRef={el => (buttUpdate.current = el)}
                            title='salvar versão atual'
                        ><img className="Button-Save Bt-size1-updateC Current-version" border="0" src={img12} alt="Salvar" />
                        </Button>

                        <Button
                            id='buttonNewVersion'
                            color="primary"
                            size="lg"
                            className="Save Save-new-version"
                            onClick={() => setRenderPopupCommentaryVersion(true)}
                            title='salvar nova versão'
                        ><img className="Button-Save Bt-size1-updateC New-version" border="0" src={img13} alt="Nova Versão" />
                        </Button>
                    </div>

                    <div className='Receipts-Buttons'>
                        <Button
                            id='butonAuthValidator'
                            color="primary"
                            size="lg"
                            className="Validator-authentication"
                            innerRef={el => (buttAuthValidator.current = el)}
                            onClick={() => setRenderPopupImportReceipt(true)}
                        > (+) COMPROVANTE FÍSICO </Button>
                        <Button
                            id='buttonAuthEletronic'
                            color="primary"
                            size="lg"
                            className="Electronic-authentication"
                            innerRef={el => (buttAuthEletronic.current = el)}
                            onClick={() => setRenderPopupInformUrl(true)}
                        > (+) COMPROVANTE VIA LINK </Button>
                    </div>
                </div>

                <div className='Third-Line'>

                    <div className="Box-Experiences">
                        <h2>Competências por grupo</h2>
                        <br />
                        <EntriesMap entries={entryList} loadReceipts={showReceipts} />
                    </div>

                    <div className='Entry-Receipts'>
                        <CardReceipt
                            update={updateCards}
                            receipts={receiptList}
                            deleteMethod={deleteReceipOfList}
                            iconWaiting={img9}
                            iconChecked={img10}
                            iconInvalid={img11}
                            iconReciclebin={img14}
                        />
                    </div>
                </div>

                {/* Popup para envio de arquivo físico */}
                <PopupSpace render={renderPopupImportReceipt}>
                    <h2 className='Center'>Upload de Arquivo</h2>
                    <div className='In-line'>
                        <h3>Arquivo:</h3>
                        <input type='text' disabled={true} className='Input-arquive' placeholder={currentReceiptFileName} />
                        <input
                            type='file'
                            accept='.jpeg, .jpg, .png, .pdf'
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
                        >
                            <img className="Icon" border="0" src={iconUpReceipt} alt="Enviar arquivo" />
                            <b>ENVIAR</b>
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
                            disabled={currentReceiptFileName === "***"}
                            onClick={addReceiptAndUpdateListCard}
                        >
                            <b>ADICIONAR COMP</b>
                        </Button>
                        <Button id='buttonCancelSendFisicalReceipt' color="danger" size="lg" onClick={cancelUploadReceipt}>
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
                        <Button
                            id='buttonAddReceiptLink'
                            color="primary"
                            size="lg"
                            disabled={currentLink === ""}
                            onClick={addLinkReceipt}
                        >
                            <b>ADICIONAR COMP</b>
                        </Button>

                        <Button id='buttonCancelAddReceiptLink' color="danger" size="lg" onClick={cancelLinkAuth}>
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
                        >
                            <b>SALVAR</b>
                        </Button>

                        <Button id='buttonCancelSaveNewVersion' color="danger" size="lg" onClick={cancelSaveNewVersion}>
                            <b>CANCELAR</b>
                        </Button>
                    </div>
                </PopupSpace>

                <div className='Bottom-icons'>
                    <div className='Icons-flex'>
                        <img id="ico-WithoutProof" className="Button-WithoutProof" border="0" src={img8} width="40" height="40" alt="Sem Comprovante" />
                        <h6>Sem Comprovante</h6>
                    </div>
                    <div className='Icons-flex'>
                        <img id="ico-Proven" className="Button-Proven" border="0" src={img10} width="40" height="40" alt="Comprovado por Validador" />
                        <h6>Comprovante Enviado</h6>
                    </div>
                </div>
            </div>
        </div>
    );
}