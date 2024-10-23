# Browser Privacy Detector

Browser Privacy Detector é uma extensão para Firefox que analisa e avalia a privacidade das páginas que você visita. Ela detecta conexões de terceiros, armazenamento local, tentativas de fingerprinting e possíveis ameaças de sequestro do navegador, fornecendo uma pontuação de privacidade baseada nesses fatores.

## Funcionalidades

### Conexões de Terceiros
Monitora e lista todos os domínios de terceiros conectados pelo site atual.  
**Importância**: Conexões a domínios de terceiros podem indicar compartilhamento de dados sem o seu consentimento.

### Detecção de Fingerprinting de Canvas
Identifica tentativas de fingerprinting usando métodos de canvas como `toDataURL` e `getImageData`.  
**Importância**: Fingerprinting permite que sites rastreiem usuários sem depender de cookies.

### Detecção de Sequestro de Navegador
Detecta alterações suspeitas em `window.location` que podem indicar redirecionamentos não autorizados.  
**Importância**: Protege contra scripts maliciosos que tentam redirecionar ou manipular sua navegação.

### Análise de Armazenamento Local
Conta o número de itens armazenados no `localStorage` pelo site.  
**Importância**: Sites podem armazenar dados persistentes que afetam sua privacidade.

### Monitoramento de Cookies
Exibe a quantidade de cookies de primeira parte, de terceiros e supercookies configurados pelo site.  
**Importância**: Cookies podem ser usados para rastreamento e perfilamento de usuários.

## Pontuação de Privacidade
A pontuação inicia em 100 pontos e deduz pontos com base nos seguintes critérios:

- **Conexões de Terceiros**:
  - Dedução: -1 ponto por domínio detectado (máximo de -20 pontos).
- **Itens de Armazenamento Local**:
  - Dedução: -0,5 ponto por item (máximo de -10 pontos).
- **Cookies**:
  - Cookies de Terceiros: -0,5 ponto por cookie.
  - Supercookies: -1 ponto por cookie.
  - Dedução máxima: -20 pontos.
- **Tentativas de Fingerprinting**:
  - Dedução: -5 pontos por tentativa (máximo de -30 pontos).
- **Sequestro de Navegador**:
  - Dedução: -5 pontos por tentativa (máximo de -40 pontos).

> **Nota**: A pontuação mínima é 0 e a máxima é 100.

## Instalação

1. Baixe ou clone este repositório para o seu computador.
2. Abra o Firefox Developer Edition.
3. Navegue para `about:debugging#/runtime/this-firefox` na barra de endereços.
4. Clique em "Carregar Extensão Temporária".
5. Selecione o arquivo `manifest.json` na pasta do projeto.
6. A extensão será carregada e aparecerá na barra de ferramentas.

## Como Usar

1. Visite o site que deseja analisar.
2. Clique no ícone do **Browser Privacy Detector** na barra de ferramentas.
3. No popup, clique em **Scan Now** para iniciar a análise.

Após a varredura, o popup exibirá:

- **Pontuação de Privacidade**: Sua pontuação de 0 a 100.
- **Conexões de Terceiros**: Lista dos domínios detectados.
- **Itens de Armazenamento Local**: Número de itens armazenados.
- **Tentativas de Fingerprinting**: Detalhes dos métodos utilizados.
- **Tentativas de Sequestro de Navegador**: Informações sobre os métodos interceptados.
- **Cookies**: Quantidade de cookies de primeira parte, terceiros e supercookies.

## Observações

- **Limitações**: Alguns sites possuem políticas de segurança que podem limitar a capacidade de detecção da extensão.
- **Feedback**: Se encontrar problemas ou tiver sugestões, entre em contato ou abra uma issue no repositório.
- **Creditos**: Este projeto foi auxiliado com ChatGPT, incluindo o ícone da extensão.