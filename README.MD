
# Gerenciamento de Categorias - API RESTful

Esta é uma API RESTful construída para o gerenciamento de categorias e subcategorias. O projeto foi desenvolvido utilizando **Node.js**, **Express**, **MongoDB** e **TypeScript**, seguindo boas práticas de desenvolvimento, incluindo SOLID e tratamento de erros adequado. A aplicação oferece funcionalidades como CRUD (Criar, Ler, Atualizar, Deletar), hierarquia entre categorias pai e filha, filtros dinâmicos e cache.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript no lado do servidor.
- **Express.js**: Framework minimalista para construção de APIs.
- **MongoDB**: Banco de dados NoSQL utilizado para persistência dos dados.
- **Mongoose**: Biblioteca de modelagem de objetos MongoDB para Node.js.
- **TypeScript**: Superset do JavaScript com tipagem estática, garantindo maior segurança no código.
- **Jest**: Framework de testes para garantir a qualidade do código.
- **Swagger**: Utilizado para documentação da API e facilitar a interação com os endpoints.

## Funcionalidades

1. **CRUD Básico de Categorias**:
    - Criar uma nova categoria.
    - Listar categorias com filtros por nome, status ativo e paginação.
    - Atualizar as informações de uma categoria existente.
    - Excluir uma categoria, com suporte à exclusão recursiva de filhos.

2. **Hierarquia de Categorias**:
    - Cada categoria pode ter subcategorias (filhas), com relação **pai-filho**.
    - Permite visualização das subcategorias de um pai em qualquer nível hierárquico.
    - Exclusão recursiva de categorias: a exclusão de uma categoria pai remove todas as suas subcategorias.

3. **Filtros e Paginação**:
    - Permite buscar categorias por nome, status ativo e fornece paginação para facilitar a navegação nas listas de categorias.

4. **Tratamento de Erros**:
    - Uso de `try-catch` para captura de erros em todas as rotas da API, com retorno de mensagens claras e específicas para o cliente e o desenvolvedor.

5. **Testes**:
    - Implementação de testes unitários utilizando o **Jest**, para garantir que cada funcionalidade esteja funcionando corretamente.

## Como Rodar o Projeto

### Pré-requisitos

- **Node.js**: Certifique-se de ter o Node.js instalado na sua máquina.
- **MongoDB**: Banco de dados MongoDB rodando localmente ou uma instância remota.

### Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/ramonsabino/Redi_Challenge.git
   cd Redi_Challenge
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente no arquivo `.env`:

   - `MONGO_URI`: URI de conexão com o MongoDB.

4. Para rodar o servidor:

   ```bash
   npm run dev
   ```

5. A API estará disponível em `http://localhost:3000`.

### Endpoints da API

A seguir estão os principais endpoints da API:

#### 1. **Criar Categoria**
   - **POST** `/categorias`
   - Corpo da requisição:
     ```json
     {
       "nome": "Nome da Categoria",
       "ativo": true,
       "pai": "ID da Categoria Pai"
     }
     ```

#### 2. **Listar Categorias**
   - **GET** `/categorias`
   - Parâmetros de query:
     - `nome`: Filtra pelo nome da categoria.
     - `ativo`: Filtra pela categoria ativa (true/false).
     - `page`: Página de resultados para paginação.
     - `size`: Tamanho da página.
     - `sort`: Ordenação (por exemplo, `nome`).

#### 3. **Listar Subcategorias**
   - **GET** `/categorias/:id/subcategorias`
   - Parâmetros:
     - `id`: ID da categoria pai.

#### 4. **Atualizar Categoria**
   - **PUT** `/categorias/:id`
   - Corpo da requisição:
     ```json
     {
       "nome": "Novo Nome",
       "ativo": false
     }
     ```

#### 5. **Deletar Categoria**
   - **DELETE** `/categorias/:id`

### Como Executar os Testes

Para rodar os testes unitários:

```bash
npm test
```

Isso executará os testes utilizando o **Jest**, validando as funcionalidades da API.

## Considerações Finais

Este projeto foi desenvolvido com foco na escalabilidade, organização e clareza do código. Utilizei práticas recomendadas como o uso de **TypeScript** para garantir a tipagem segura e **MongoDB** para um modelo de dados flexível.
