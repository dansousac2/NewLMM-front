import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VersionListing.css';

import AuthenticationApiService from '../../services/AuthenticationApiService';
import VersionsService from '../../services/CurriculumService';

import { Button } from 'reactstrap';
import CurriculumCard from '../../components/Curriculum/CurriculumCard';
import PopupSpace from '../../components/FormGroup/PopupSpace';
import LeftMenu from '../../components/Menu/LeftMenu';
import { showSuccessMessage } from '../../components/Toastr/Toastr';

const service = VersionsService;
const authService = AuthenticationApiService;

export default function VersionListing() {

  const navigate = useNavigate();

  const [curriculumList, setCurriculumList] = useState([]);
  const [renderConfirmExclusion, setRenderConfirmExclusion] = useState(false);
  const [curriculumIdToExclude, setCurriculumIdToExclude] = useState(null);

  useEffect(() => {
    find();
  }, []);

  async function find() {
    try {
      const response = await service.findAllByUserId(authService.getLoggedUser().id);
      setCurriculumList(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  function renderPopup(id) {
    setRenderConfirmExclusion(true);
    setCurriculumIdToExclude(id);
  }

  function cancelExclusion() {
    setRenderConfirmExclusion(false);
    setCurriculumIdToExclude(null);
  }

  async function deleteCurriculum(id) {
    try {
      await service.delete(id);
      await find();
      setRenderConfirmExclusion(false);
      showSuccessMessage('Versão Excluída!');
    } catch (error) {
      console.error(error);
    }
  }

  function editCurriculum(id) {
    navigate(`/updateversions/${id}`);
  }

  return (
    <div className="Versions-Screen">

      <div className='Menu'>
        <LeftMenu />
      </div>

      <div className='Body'>

        <div className='List-curriculum-cards'>
          <CurriculumCard
            curriculums={curriculumList}
            className={"All-curriculum-cards"}
            delete={renderPopup}
            edit={editCurriculum}
          />
        </div>
        
        <PopupSpace render={renderConfirmExclusion}>
          <br /><br />
          <h2 className='Center'><b>Confirmação de exclusão de Versão</b></h2>
          <h3 className='Center'>Não será mais possível recuperar esta versão!</h3>
          <br /><br />
          <div className='Buttons-exclude-popup'>
            <Button id='buttonConfirm' color="danger" size="lg" onClick={() => deleteCurriculum(curriculumIdToExclude)}>
              <b>CONFIRMAR</b>
            </Button>
            <Button id='buttonCancel' color="primary" size="lg" onClick={cancelExclusion}>
              <b>CANCELAR</b>
            </Button>
          </div>
        </PopupSpace>
      </div>

    </div>
  );
}