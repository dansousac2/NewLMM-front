import { useNavigate, useLocation } from "react-router-dom";

import './LeftMenu.css';

import imgImport from '../../assets/images/import.svg';
import imgHistory from '../../assets/images/history.svg';
import imgExport from '../../assets/images/export.svg';
import imgOff from '../../assets/images/off.svg';
import { Button } from "reactstrap";

import AuthService from "../../services/AuthenticationApiService";

import CreateButtonLM from "./DefaultLeftMenuButton";

export default function LeftMenu() {

    const loggedUser = AuthService.getLoggedUser();
    const navigate = useNavigate();


    // devolve a função para o botão, sem executá-la no momento da renderização do mesmo
    const goTo = (path) => () => navigate(path);

    // Logout
    const logout = async () => {
        try {
            await AuthService.logout();
            navigate("/");
        } catch (error) {
            alert("(!) A sessão não pode ser encerrada (!)");
            console.log(error);
        }
    };

    return (
        <div className="LeftMenu">
            <h1 onClick={goTo("/home")}>Lattes</h1>
            <h2>+ +</h2>
            <h5 id="name-owner">{loggedUser?.name || 'Usuário'}</h5>
            <div className="AllButtons">

                <CreateButtonLM label='Importar Currículo' path='/home' onClickPath='/home'>
                    <img id="ico-import" src={imgImport} width="50" height="50" />
                </CreateButtonLM>

                <CreateButtonLM label='Versões' path='/versionlisting' onClickPath='/versionlisting'>
                    <img id="ico-version" src={imgHistory} width="40" height="40" />
                </CreateButtonLM>

                <CreateButtonLM label='Exportar' path='/exportpdf' onClickPath='/exportpdf'>
                    <img id="ico-export" src={imgExport} width="50" height="50" />
                </CreateButtonLM>

                <Button color='danger' onClick={logout} className='btn-split'>
                    <div className="left"><img id="ico-exit" className="Button-icon" src={imgOff} width="40" height="40" /></div>
                    <div className="right">Sair</div>
                </Button>

            </div>
            <div className="Fields Area"></div>
            <div className="Fields Image"></div>
        </div>
    );
}