# VINIS3NA.DEV — KRAKEN Command Center V3

## Status de publicação

O site V3 está versionado em `main/docs/index.html` no repositório pessoal `vinis3na-dev/vinis3na-dev`. O README do perfil e os demais projetos não precisam ser alterados para servir o site.

## Como ativar GitHub Pages

1. Abra https://github.com/vinis3na-dev/vinis3na-dev/settings/pages
2. Em **Build and deployment**, escolha **Deploy from a branch** em **Source**.
3. Selecione a branch **main**, pasta **/docs**, e clique em **Save**.
4. Confira o link informado pela própria página do GitHub Pages; o endereço esperado para esse repositório é https://vinis3na-dev.github.io/vinis3na-dev/.
5. Abra o site em desktop e celular. Se a página demorar a aparecer, acompanhe a publicação na aba **Actions**.

## Limitações conhecidas

- O site usa as artes públicas hospedadas em `main/assets/` deste mesmo repositório; elas são conceituais, não screenshots reais dos aplicativos.
- A opção experimental de modelo 3D importa Three.js da CDN do jsDelivr somente após um clique; requer navegador com WebGL e conexão à rede. O site tem fallback.
- Áudio é opcional e começa desativado.
- O README da página de perfil não executa JavaScript, por isso a experiência interativa acontece apenas no GitHub Pages.
- Repositórios privados exigem permissão para serem abertos e não devem ser expostos.
- Não há dados de atividade inventados nem indicadores fictícios.
- Esta publicação não altera N3xus-dev nem configura o Pages automaticamente.

## Como atualizar

Edite `docs/index.html`, mantenha `main/assets/` com os recursos utilizados e valide o resultado após a publicação.
