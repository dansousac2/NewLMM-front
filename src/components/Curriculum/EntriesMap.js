import React from "react";
import './EntriesMap.css';

import iconWithout from '../../assets/images/WithoutProof.svg';
import iconSent from '../../assets/images/Proven.svg';
import iconWaiting from '../../assets/images/Waiting.svg';
import iconInvalid from '../../assets/images/Invalidated.svg';

function handleMouseEnter(e) {
    e.target.classList.add('Change-color-p');
}

function handleMouseLeave(e) {
    e.target.classList.remove('Change-color-p');
}

function EntriesMap({ entries, loadReceipts }) {

    const iconToLoad = (receipts) => {

        if (receipts.length === 0) {
            return (
                <img className="Icons" src={iconWithout} />
            )
        } else if (receipts.some(rec => String(rec.id).includes('new') )) {
            return (
                <img className="Icons" src={iconWaiting} />
            )
        } else {
            return (
                <img className="Icons" src={iconSent} />
            )
        }
    }

    var groupIdentified = "";

    const entriesToReturn = entries.map((entry) => {

        if (groupIdentified != entry.group) {
            groupIdentified = entry.group;

            return (
                <div key={`group${entry.id}`}>
                    <h4>{entry.group}</h4>
                    <div className="Entry-and-icons">
                        <div className="Up-icon">
                            {iconToLoad(entry.receipts)}
                        </div>
                        <p key={entry.id} id={entry.id} onClick={elem => loadReceipts(entry.receipts, elem.target)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                            {entry.name}
                        </p>
                    </div>
                </div>
            )
        } else {
            return (
                <div key={entry.id} className="Entry-and-icons">
                    <div className="Up-icon">
                        {iconToLoad(entry.receipts)}
                    </div>
                    <p id={entry.id} onClick={elem => loadReceipts(entry.receipts, elem.target)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        {entry.name}
                    </p>
                </div>
            )
        }

    })

    return (
        <div className="Entries-maped">
            {entriesToReturn}
        </div>
    );
}
export default EntriesMap;