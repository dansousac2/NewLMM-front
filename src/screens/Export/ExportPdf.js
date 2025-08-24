import { useState, useEffect, useRef } from "react";
import "./ExportPdf.css";

import LeftMenu from "../../components/Menu/LeftMenu";
import { showErrorMessage } from "../../components/Toastr/Toastr";
import CurriculumTableRS from "../../components/SchedulingTable/CurriculumTableRS";
import { Button } from "reactstrap";
import LoadingComp from "../../components/Extra/LoadingComp";

import VersionsService from "../../services/VersionsService";
import AuthenticationApiService from "../../services/AuthenticationApiService";
import PdfService from "../../services/PdfService";
import { getAxcessPath } from "../../services/ServerService";
import StorageService from "../../services/StorageService";

const curriculumService = VersionsService;
const authService = AuthenticationApiService;
const pdfService = PdfService;
const storage = new StorageService();

export default function ExportPdf() {
    const [curriculumList, setCurriculumList] = useState([]);
    const [selectedCurriculum, setSelectedCurriculum] = useState(null);
    const [renderLoading, setRenderLoading] = useState(false);
    const [linkPdf, setLinkPdf] = useState("");

    const linkDownloadRef = useRef(null);

    // Função para buscar os currículos ao montar o componente
    useEffect(() => {
        find();
    }, []);

    const find = () => {
        curriculumService
            .findAllByUserId(authService.getLoggedUser().id)
            .then((response) => {
                setCurriculumList(response.data);
            })
            .catch((error) => {
                showErrorMessage(error.data);
                console.error(error);
            });
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

        setRenderLoading(true);

        if (linkPdf === "") {
            console.log("foi no banco");
            try {
                const response = await pdfService.generate(
                    selectedCurriculum.id,
                    authService.getLoggedUser().id
                );
                const newLink = getAxcessPath(response.data) + noCache();
                setLinkPdf(newLink);
                storage.setItem(getSelectedCurriculumKeyMap(selectedCurriculum), newLink);
            } catch (error) {
                showErrorMessage(error.data);
                console.log(error);
            }
        } else {
            setLinkPdf(storage.getItem(getSelectedCurriculumKeyMap()));
        }

        setRenderLoading(false);

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
            <LoadingComp render={renderLoading} />
        </div>
    );
}