# TODO API

Este projeto é um desafio utilizando o framework NestJS. O objetivo é criar uma API para gerenciar tarefas.

## Tecnologias Utilizadas

- NestJS
- Prisma
- PostgreSQL
- Node.js
- Docker

## Requisitos

- Node.js versão 20 ou superior
- Docker

## Instalação

1. Clone este repositório
2. Instale as dependências com `pnpm install`
3. Execute o comando `pnpm dev` para criar o container do banco de dados e rodar a aplicação

## Testes

Para rodar os testes unitários, execute o comando `pnpm test`
Para rodar os testes de integração, execute o comando `pnpm test:e2e`

## Documentação

A documentação da API foi feita utilizando o Swagger. Para acessar, acesse http://localhost:3000/api.

Também existe uma pasta chamada `requests` com vários arquivos `.http` com exemplos de requisições para a API e que podem ser utilizados com a extensão `REST Client` do Visual Studio Code.

## Endpoints

| Método | Endpoint   | Descrição                                |
| ------ | ---------- | ---------------------------------------- |
| GET    | /register  | Cadastra um novo usuário                 |
| POST   | /login     | Realiza o login do usuário               |
| GET    | /me        | Retorna as informações do usuário logado |
| GET    | /tasks     | Retorna todas as tarefas cadastradas     |
| POST   | /tasks     | Cadastra uma nova tarefa                 |
| GET    | /tasks/:id | Retorna uma tarefa pelo ID               |
| PUT    | /tasks/:id | Atualiza uma tarefa pelo ID              |
| DELETE | /tasks/:id | Deleta uma tarefa pelo ID                |
