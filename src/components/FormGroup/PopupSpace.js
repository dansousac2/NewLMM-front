import React from "react";
import './PopupSpace.css';

export default function PopupSpace(props) {

        if (props.render) {
            return (
                <div className="Popup-2">
                    <div className={`Popup-content-2 ${props.className}`}>
                        {props.children}
                    </div>
                </div>
            )
        }
};