import React from "react";
import './CurriculumCard.css';

import { Button } from 'reactstrap';
import img14 from '../../assets/images/recyclebinEmpty.svg';
import iconEdit from '../../assets/images/editCurriculum.svg';

function CurriculumCard({curriculums, className, edit, delete: onDelete}) {

    if(!curriculums || curriculums.length === 0) {
        return (
            <div key='curriculumEmpty' className='Card-curriculum'>
                <h1>Ainda não existem versões de currículos criadas! <br/> Inicie Importando um currículo XML!</h1>
            </div>
        )
    }

    const cardsCurriculum = curriculums.map(curriculum => {

        return (
            <div key={curriculum.id} className="Card-curriculum">
                <div className="Version-Commentary Center">
                    <h1 id='version'>{curriculum.version}</h1>
                    <h5 id='commentary'>{curriculum.description}</h5>
                </div>
                <div className="Modification-date Center">
                    <h3>Alterado em:</h3>
                    <h4 id='modificationDateAndTime'>{curriculum.lastModification}</h4>
                </div>
                <div className="Buttons">
                    <Button color="primary" id='btedit' onClick={() => edit(curriculum.id)}>
                        <img id="ico-edit" className="Button-edit" border="0" src={iconEdit} width="120" height="30" />
                    </Button>
                    <Button color="danger" id="exbuttonVL" onClick={() => onDelete(curriculum.id)} >
                        <img id="ico-delete" className="Button-delete" border="0" src={img14} width="120" height="30" />
                    </Button>
                </div>
            </div>
        )
    })

    return (
        <div className={className}>
            {cardsCurriculum}
        </div>
    )
}
export default CurriculumCard;