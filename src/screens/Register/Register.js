import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import FormGroup from "../../components/FormGroup/FormGroup";
import { showErrorMessage, showSuccessMessage } from "../../components/Toastr/Toastr";
import './Register.css';
import UserApiService from '../../services/UserApiService';
import { AuthContext } from '../../main/SessionProvider';

export default function Register() {
    const service = UserApiService;
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        const errors = [];

        if (!form.name.trim()) {
            errors.push('Por favor, informe o seu nome!');
        }
        if (!form.email) {
            errors.push('Por favor, informe o seu e-mail!');
        } else if (!form.email.match(/^[a-z0-9.]+@[a-z0-9]+\.[a-z]/)) {
            errors.push('E-mail inválido!');
        }
        if (!form.password) {
            errors.push('Por favor, informe a sua senha!');
        }

        return errors;
    };

    const submit = async () => {
        const errors = validate();
        if (errors.length > 0) {
            errors.forEach(showErrorMessage);
            return;
        }

        try {
            service.create(form);
            showSuccessMessage("Usuário Cadastrado com Sucesso!");

            const user = await login(form.email, form.password);
            if (user) {
                navigate('/home');
            } else {
                showErrorMessage('Credenciais inválidas!');
            }
        } catch (error) {
            console.error(error.response || error);
        }
    };

    return (
        <div className='Register-Screen'>
            <h1>Cadastro</h1>
            <h2>
                Já possui uma conta? <Link to="/">clique aqui</Link> para fazer Login
            </h2>

            <div className='labels'>
                <FormGroup label='Nome' htmlFor='lab01'>
                    <input
                        className="form-control"
                        type="text"
                        id="lab01"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                </FormGroup>
                <FormGroup label='E-mail' htmlFor='lab02'>
                    <input
                        className="form-control"
                        type="email"
                        id="lab02"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                </FormGroup>
                <FormGroup label='Senha' htmlFor='lab03'>
                    <input
                        className="form-control"
                        type="password"
                        id="lab03"
                        value={form.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                    />
                </FormGroup>
            </div>

            <div className='button'>
                <Button className="RegisterUser" onClick={submit}>
                    CADASTRAR
                </Button>
            </div>
        </div>
    );
}