# Guarda — 1º GBM

Interface pública do Sistema de Controle de Acesso da Guarda, organizada para publicação no GitHub Pages do BravoNexo.

## Estrutura

```text
/
├── .nojekyll
├── index.html          # Entrada que encaminha para o sistema do 1º GBM
└── 01gbm/
    ├── index.html      # Aplicativo da Guarda
    ├── app.js          # Código principal em uso
    ├── script.js       # Código legado preservado
    ├── style.css       # Estilos do aplicativo
    └── brasao.png      # Identidade visual do 1º GBM
```

O aplicativo do 1º GBM fica disponível em `/guarda/01gbm/`. Os caminhos internos permanecem relativos, permitindo que os arquivos sejam servidos diretamente pelo GitHub Pages.

O frontend aponta para a implantação institucional do Apps Script criada pela conta `bravonexo01gbm@gmail.com`.
