import { useEffect, useRef, useState } from "react";
import "./ExportPdf.css";

import { Button } from "reactstrap";
import LeftMenu from "../../components/Menu/LeftMenu";
import CurriculumTableRS from "../../components/SchedulingTable/CurriculumTableRS";
import { showErrorMessage } from "../../components/Toastr/Toastr";
import LoadingComp from "../../components/Extra/LoadingComp";
import { spinnerOnRequest } from "../../components/Extra/Utils";

import AuthenticationApiService from "../../services/AuthenticationApiService";
import PdfService from "../../services/PdfService";
import StorageService from "../../services/StorageService";
import CurriculumService from "../../services/CurriculumService";

const curriculumService = CurriculumService;
const authService = AuthenticationApiService;
const pdfService = PdfService;
const storage = StorageService();

export default function ExportPdf() {

    const [curriculumList, setCurriculumList] = useState([]);
    const [selectedCurriculum, setSelectedCurriculum] = useState(null);
    const [linkPdf, setLinkPdf] = useState("");
    const [loading, setLoading] = useState(false);

    const linkDownloadRef = useRef(null);

    // Função para buscar os currículos ao montar o componente
    useEffect(() => {
        find();
    }, []);

    const find = async () => {

        try {
            const response = await spinnerOnRequest(() => curriculumService.findAllByUserId(authService.getLoggedUser().id), setLoading);
            setCurriculumList(response.data);
        } catch(error) {
            showErrorMessage('Erro ao carregar versões existentes de currículo.');
            console.error(error);
        }
    };

    const handleCurriculumSelected = (curriculum) => {
        setSelectedCurriculum(curriculum);

        if (isOnPathList(curriculum)) {
            setLinkPdf(isOnPathList(curriculum));
        } else {
            setLinkPdf("");
        }
    };

    const generatePdf = async () => {
        if (!selectedCurriculum) return;

        if (linkPdf === "") {
            try {
                const response = await spinnerOnRequest(() => pdfService.generate(selectedCurriculum.id, authService.getLoggedUser().id), setLoading);

                const newLink = response.data + noCache();

                setLinkPdf(newLink);

                storage.setItem(getSelectedCurriculumKeyMap(selectedCurriculum), newLink);

            } catch (error) {
                showErrorMessage(error.data);
                console.log(error);
            }
        } else {
            setLinkPdf(storage.getItem(getSelectedCurriculumKeyMap()));
        }

        if (linkDownloadRef.current) {
            linkDownloadRef.current.click();
        }
    };

    const isOnPathList = (curriculum) => {
        return storage.getItem(getSelectedCurriculumKeyMap(curriculum));
    };

    const noCache = () => {
        const qsg = Date.now().toString();
        // setQueryStringGhost(qsg);
        console.log(qsg);
        return "?" + qsg;
    };

    const getSelectedCurriculumKeyMap = (curriculum = selectedCurriculum) => {
        const id = curriculum.id;
        const lastMod = curriculum.lastModification;
        return id + lastMod;
    };

    return (
        <div className="Principal Fields">

            <LoadingComp render={loading} />

            <LeftMenu />
            <div className="Border-1">
                <h1>Selecione uma versão para ser exportada</h1>
                <br />
                <div className="Table-div-export">
                    <CurriculumTableRS
                        curriculums={curriculumList}
                        versionSelected={handleCurriculumSelected}
                    />
                    <div className="Button-div">
                        <Button
                            color="primary"
                            size="lg"
                            disabled={!selectedCurriculum}
                            onClick={generatePdf}
                        >
                            GERAR PDF
                        </Button>
                        <a
                            hidden
                            ref={linkDownloadRef}
                            href={linkPdf}
                            download="CurriculoLMM-comp"
                            target="_blank"
                            rel="noreferrer"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}