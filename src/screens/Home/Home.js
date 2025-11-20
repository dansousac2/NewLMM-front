import { useState } from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

import "./Home.css";

import FileUpload from "../../components/FormGroup/FileUpload";
import { showErrorMessage } from "../../components/Toastr/Toastr";
import LoadingComp from "../../components/Extra/LoadingComp";
import { spinnerOnRequest } from "../../components/Extra/Utils";

import CurriculumService from "../../services/CurriculumService";
import AuthenticationApiService from "../../services/AuthenticationApiService";

import LeftMenu from "../../components/Menu/LeftMenu";
import PopupSpace from "../../components/FormGroup/PopupSpace";

const curriculumService = CurriculumService;
const authentication = AuthenticationApiService;

const maxQuantityCharComment = 30;

export default function Home() {

  const navigate = useNavigate();

  const [owner, setOwner] = useState("");
  const [renderCurriculumConfirmation, setRenderCurriculumConfirmation] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [renderComent, setRenderComent] = useState(false);
  const [comment, setComment] = useState(null);

  const sendFile = async () => {

    setRenderComent(false);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("userId", authentication.getLoggedUser().id);
      if(comment) data.append('coment', comment);

      const response = await spinnerOnRequest(() => curriculumService.createNewVersion(data), setLoading);
      navigate(`/updateversions/${response.data}`);
    } catch (error) {
      showErrorMessage("Erro ao enviar o arquivo!");
      console.error(error.response || error);
    }
  };

  const verifyIdentity = (selectedFile) => {
    const reader = new FileReader();
    reader.readAsText(selectedFile);
    reader.onload = (e) => {
      const stringXml = e.target.result;
      const parser = new DOMParser();
      const docXml = parser.parseFromString(stringXml, "text/xml");

      const ownerName = docXml.querySelector("DADOS-GERAIS")
        ?.attributes.getNamedItem("NOME-COMPLETO")
        ?.value;

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
    setRenderCurriculumConfirmation(false);
    setRenderComent(false);
    setOwner("");
    setFile(null);
  };

  const renderPopupComent = () => {
    setRenderCurriculumConfirmation(false);
    setRenderComent(true);
  };

  return (
    <div className="Principal Fields">

      <LoadingComp render={loading} />

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
          <Button color="primary" size="lg" onClick={renderPopupComent}>
            SIM, SOU EU!
          </Button>
          <Button color="danger" size="lg" onClick={cancelImportCurriculum}>
            NÃO, CANCELAR!
          </Button>
        </div>
      </PopupSpace>

      <PopupSpace render={renderComent} className="Popup-home">
        <h2 className="Center">Adiconar comentário?</h2>
        <br />
        <input placeholder="opcional" autoFocus maxLength={maxQuantityCharComment} onChange={e => setComment(e.target.value)}/>
        <br />
        <br />
        <br />
        <div className="Buttons-home-confimation">
          <Button color="primary" size="lg" onClick={sendFile}>
            ENVIAR
          </Button>
          <Button color="danger" size="lg" onClick={cancelImportCurriculum}>
            CANCELAR
          </Button>
        </div>
      </PopupSpace>
    </div>
  );
}
