import { useState } from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

import "./Home.css";

import FileUpload from "../../components/FormGroup/FileUpload";
import { showErrorMessage } from "../../components/Toastr/Toastr";

import CurriculumService from "../../services/CurriculumService";
import AuthenticationApiService from "../../services/AuthenticationApiService";

import LeftMenu from "../../components/Menu/LeftMenu";
import PopupSpace from "../../components/FormGroup/PopupSpace";

const curriculumService = CurriculumService;
const authentication = AuthenticationApiService;

export default function Home() {
  
  const navigate = useNavigate();
  
  const [owner, setOwner] = useState("");
  const [renderCurriculumConfirmation, setRenderCurriculumConfirmation] = useState(false);
  const [file, setFile] = useState(null);

  const sendFile = async () => {
    setRenderCurriculumConfirmation(false);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("userId", authentication.getLoggedUser().id);

      const response = await curriculumService.createNewVersion(data);
      navigate(`/updateversions/${response.data}`);
    } catch (error) {
      console.error(error.response || error);
      showErrorMessage("Erro ao enviar o arquivo!");
    }
  };

  const verifyIdentity = (selectedFile) => {
    const reader = new FileReader();
    reader.readAsText(selectedFile);
    reader.onload = (e) => {
      const stringXml = e.target.result;
      const parser = new DOMParser();
      const docXml = parser.parseFromString(stringXml, "text/xml");

      const ownerName = docXml
        .querySelector("DADOS-GERAIS")
        ?.attributes.getNamedItem("NOME-COMPLETO")?.value;

      if (!ownerName) {
        showErrorMessage("Currículo inválido! Reveja o arquivo enviado!");
        return;
      }

      setOwner(ownerName);
      setRenderCurriculumConfirmation(true);
      setFile(selectedFile);
    };
  };

  const cancelImportCurriculum = () => {
    setOwner("");
    setRenderCurriculumConfirmation(false);
    setFile(null);
  };

  return (
    <div className="Principal Fields">
      <LeftMenu />

      <div className="Text-Home">
        <p>PARA COMEÇAR VOCÊ PODE:</p>
        <p>
          - Importar um novo currículo XML, criado na plataforma Lattes, através
          do botão "IMPORTAR"
        </p>
      </div>

      <FileUpload accept=".xml" toSendAttribute={verifyIdentity} />

      <PopupSpace render={renderCurriculumConfirmation} className="Popup-home">
        <h2 className="Center">Confirmação de identidade do currículo importado</h2>
        <br />
        <h2 className="Center NameOwner">{owner}</h2>
        <br />
        <br />
        <h2 className="Center">Confirma?</h2>
        <div className="Buttons-home-confimation">
          <Button color="primary" size="lg" onClick={sendFile}>
            SIM, SOU EU!
          </Button>
          <Button color="danger" size="lg" onClick={cancelImportCurriculum}>
            NÃO, CANCELAR!
          </Button>
        </div>
      </PopupSpace>
    </div>
  );
}
