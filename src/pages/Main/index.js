import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import Container from '../../components/Container';
import { Form, SubmitButton, List, MessageError } from './styles';

import api from '../../services/api';
import Repository from '../Repository';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    hasError: false,
    messageError: '',
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    try {
      e.preventDefault();
      this.setState({ loading: true });

      const { newRepo, repositories, hasError } = this.state;

      const exists = repositories.some(item => item.name === newRepo);
      if (exists) {
        throw new Error('Repositório duplicado');
      }

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
      });
    } catch (error) {
      if (error.message !== 'Repositório duplicado') {
        this.setState({ messageError: 'Repositório não existe' });
      } else {
        this.setState({ messageError: `${error.message}` });
      }
      this.setState({ loading: false });

      return this.setState({ hasError: true });
    }
  };

  render() {
    const {
      newRepo,
      loading,
      repositories,
      hasError,
      messageError,
    } = this.state;
    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>
        <Form onSubmit={this.handleSubmit} hasError={hasError}>
          <input
            type="text"
            placeholder="Adicionar repositorio"
            value={newRepo}
            onChange={this.handleInputChange}
            className={hasError ? 'error' : ''}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )}
          </SubmitButton>
        </Form>

        {hasError ? <MessageError>{messageError}</MessageError> : ''}
        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
