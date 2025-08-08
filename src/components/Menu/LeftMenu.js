import { useNavigate, useLocation } from "react-router-dom";

import './LeftMenu.css';

import imgImport from '../../assets/images/import.svg';
import imgHistory from '../../assets/images/history.svg';
import imgExport from '../../assets/images/export.svg';
import imgOff from '../../assets/images/off.svg';

import AuthService from "../../services/AuthenticationApiService";

export default function LeftMenu() {

    const navigate = useNavigate();
    const location = useLocation();
    const loggedUser = AuthService.getLoggedUser();

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
        <div className="ScheduleValidation01">
            <h1 onClick={goTo("/home")}>Lattes</h1>
            <h2>+ +</h2>
            <h5 id="name-owner">{loggedUser?.name || 'Usuário'}</h5>
            <div className="AllButtons">

                <button className={`btn-import ${location.pathname.includes('/home') ? 'Underline' : ''}`} onClick={goTo("/home")}>
                    <img id="ico-menu-01" className="Button-icon" src={imgImport} width="50" height="50" alt="Importar currículo" />
                    Importar currículo
                </button>

                <button className={`btn-version ${location.pathname.includes('/versionlisting') ? 'Underline' : ''}`} onClick={goTo("/versionlisting")}>
                    <img id="ico-menu-04" className="Button-icon" src={imgHistory} width="40" height="40" alt="Versões" />
                    Versões
                </button>

                <button className={`btn-export ${location.pathname.includes('/exportpdf') ? 'Underline' : ''}`} onClick={goTo("/exportpdf")}>
                    <img id="ico-menu-05" className="Button-icon" src={imgExport} width="50" height="50" alt="Exportar" />
                    Exportar
                </button>

                <button className="b6" onClick={logout}>
                    <img
                        id="ico-menu-06"
                        className="Button-icon"
                        src={imgOff}
                        width="40"
                        height="40"
                        alt="Sair"
                    />
                    Sair
                </button>

            </div>
            <div className="Fields Area"></div>
            <div className="Fields Image"></div>
        </div>
    );
}