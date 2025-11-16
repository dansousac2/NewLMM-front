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

                let icon;
                let linkLabel;
                let isFisicalFile = false;
                const comentary = rec.commentary;

                let link;

                if(rec.status === WAITING_SAVE) {
                    icon = iconWaiting;
                } else {
                    icon = iconChecked;
                }

                if (rec.url == null) {
                    /* receipt usa comprovante físico */

                    isFisicalFile = true;
                    linkLabel = rec.name.slice(0,21) + rec.extension;

                    if(String(rec.id).includes("new")) {
                        // novo comprovante físico
                        link = rec.fisicalFileUploaded;
                    } else {
                        // se comprovante já persistido
                        link = await createLinkToRead(rec.id);
                    }
                } else {
                    /* receipt usa URL */

                    linkLabel = 'Link para comprovação eletrônica';
                    link = rec.url;
                }

                return (
                    <div key={`recUni${rec.id}`} className="Receipt-unique">
                        <img className="Icons Icon-Entry" border="0" src={icon} />
                        <b id={`commRec${rec.id}`}> {comentary == null || comentary === '' ? "---" : comentary} </b>
                        <a href={link} target="_blank"> { linkLabel } </a>
                        <Button id={`btRec${rec.id}`} onClick={() => { props.deleteMethod(rec.id, isFisicalFile) }} color="danger" size="sm" >
                            <img className="Icons Icon-Entry" src={iconRecyclebin} />
                        </Button>
                    </div>
                )
            }));

            setReceipts(receiptsToCard);

        }
        createCard();
        // atualiza sempre que alterações forem feitas na lista de receipts passadas como propriedade
    }, [props.receipts]);


    return (
        <div className="Receipts-of-current-entry">
            {receipts}
        </div>
    )

};