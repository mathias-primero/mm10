# Gerador e Criptografia de Senhas

Este projeto é um site simples em HTML, CSS e JavaScript para:

- gerar senhas seguras;
- verificar a força da senha;
- criptografar textos usando a Web Crypto API;
- descriptografar o texto com a mesma chave secreta.

## Como usar

1. Abra o arquivo `index.html` em um navegador.
2. Ajuste o tamanho e os tipos de caracteres da senha.
3. Clique em "Gerar senha".
4. Use a seção de criptografia para proteger o texto com uma chave secreta.
5. Use a seção de descriptografia para recuperar o texto.

## Observações

- A criptografia usa AES-GCM com derivação de chave via PBKDF2.
- Funciona diretamente no navegador, sem depender de backend.
- O funcionamento é compatível com navegadores modernos.
