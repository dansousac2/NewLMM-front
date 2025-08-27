import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // para react-router v6+
import './Login.css';
import FormGroup from "../../components/FormGroup/FormGroup";
import { showErrorMessage, showSuccessMessage } from "../../components/Toastr/Toastr";
import { AuthContext } from '../../main/SessionProvider';
import { Button } from 'reactstrap';


export default function Login() {

    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const validate = () => {
        const errors = [];
        if (!email) {
            errors.push('Por favor, informe o seu e-mail!');
        }
        if (!password) {
            errors.push('Por favor, digite a sua senha!');
        }
        return errors;
    };

    const login = async () => {
        const errors = validate();
        if (errors.length > 0) {
            errors.forEach(msg => showErrorMessage(msg));
            return;
        }

        try {
            const user = await auth.login(email, password);
            if (user) {
                showSuccessMessage(`Usuário(a) ${user.name}, logado(a)!`);
                navigate('/home');
            } else {
                showErrorMessage('Login inválido!');
            }
        } catch (error) {
            console.error(error);
            showErrorMessage('Erro ao tentar fazer login.');
        }
    };

    return (
        <div className='Login-Screen'>
            <h1>Login</h1>
            <h2>
                Já possui uma conta?{' '}
                <a href="/register">clique aqui</a> para fazer o seu cadastro
            </h2>

            <div className='labels'>
                <FormGroup label='E-mail' htmlFor='emailImput'>
                    <input
                        className="form-control"
                        type="email"
                        id="emailImput"
                        placeholder='digite seu email'
                        onChange={e => setEmail(e.target.value)}
                    />
                </FormGroup>
                <FormGroup label='Senha' htmlFor='senhaImput'>
                    <input
                        className="form-control"
                        type="password"
                        id="senhaImput"
                        placeholder='digite sua senha'
                        onChange={e => setPassword(e.target.value)}
                    />
                </FormGroup>
            </div>

            <div className='button'>
                <Button className="Login" onClick={login} id='loginButton'>
                    LOGIN
                </Button>
            </div>
        </div>
    );
}