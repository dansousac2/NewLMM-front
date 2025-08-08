import React from "react";
import './LoadingComp.css';

import gif from '../../assets/images/gif-lattes2.gif';

export default function LoadingComp({ render }) {
    if (!render) {
        return null;
    }

    return (
        <div className="Gif-back">
            <div className="Gif-content">
                <img src={gif} id="GifImageLoading" />
            </div>
        </div>
    );
}
