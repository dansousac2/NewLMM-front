import { Button } from "reactstrap";

import { useLocation, useNavigate } from "react-router-dom";

export default function CreateButtonLM({label, onClickPath, path, children}) {

    const location = useLocation();
    const goTo = useNavigate();

    return(
        <Button color={`${location.pathname.includes(path) ? 'primary' : 'secondary'}`} onClick={() => goTo(onClickPath)} className='btn-split'>
            <div className="left">{ children }</div>
            <div className="right">{ label }</div>
        </Button>
    );
}