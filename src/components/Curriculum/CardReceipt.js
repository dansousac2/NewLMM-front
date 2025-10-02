import { useEffect, useState } from "react";
import { Button } from "reactstrap";
import './CardReceipt.css';

import iconChecked from '../../assets/images/Proven.svg';
import iconRecyclebin from '../../assets/images/recyclebinEmpty.svg';
import iconWaiting from '../../assets/images/Waiting.svg';

import AuthenticationApiService from "../../services/AuthenticationApiService";
import { createLinkToRead } from "../../services/ServerService";

const authService = AuthenticationApiService;

export const WAITING_SAVE = 'WAITING';

export default function CardReceipt(props) {

    const [receipts, setReceipts] = useState([]);

    useEffect(() => {

        const createCard = async () => {

            const receiptsToCard = await Promise.all(props.receipts.map(async rec => {

                var icon = "";
                //TODO remover
                console.log('dados do receipt');
                console.log(JSON.stringify(rec));

                if(rec.status === WAITING_SAVE) {
                    icon = iconWaiting;
                } else {
                    icon = iconChecked;
                }

                if (rec.url == null) {

                    /* receipt usa comprovante físico */

                    let readLink;

                    if(!String(rec.id).includes("new")) {
                        // se comprovante persistido no banco
                        readLink = await createLinkToRead(authService.getLoggedUser().id, rec.id, rec.extension);
                        //TODO remover
                        console.log('link retornado: ' + readLink);
                    }

                    return (
                        <div key={`recUni${rec.id}`} className="Receipt-unique">
                            <img className="Icons Icon-Entry" border="0" src={icon} />
                            <b id={`commRec${rec.id}`}> {rec.commentary == null ? "---" : rec.commentary} </b>
                            <a href={readLink} target="_blank">{ `${rec.name}${rec.extension}` }</a>
                            <Button id={`btRec${rec.id}`} onClick={() => { props.deleteMethod(rec.id, false) }} color="danger" size="sm" >
                                <img className="Icons Icon-Entry" src={iconRecyclebin} />
                            </Button>
                        </div>
                    )
                } else {
                    
                    /* receipt usa URL */

                    return (
                        <div key={`recUni${rec.id}`} className="Receipt-unique">
                            <img className="Icons Icon-Entry" border="0" src={icon} />
                            <b id={`commRec${rec.id}`}> {rec.commentary == null ? "---" : rec.commentary} </b>
                            <a href={rec.url} target="_blank"> Link para comprovação eletrônica </a>
                            <Button id={`btRec${rec.id}`} onClick={() => { props.deleteMethod(rec.id, false) }} color="danger" size="sm" >
                                <img className="Icons Icon-Entry" src={iconRecyclebin} />
                            </Button>
                        </div>
                    )
                }
            }));

            setReceipts(receiptsToCard);
        };
        createCard();
        // atualiza sempre que alterações forem feitas na lista de receipts passadas como propriedade
    }, [props.receipts, props.update]);


    return (
        <div className="Receipts-of-current-entry">
            {receipts}
        </div>
    )

};