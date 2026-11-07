Publicar um post leva dois passos.

## 1. Crie o arquivo do post

Crie `posts/meu-post.md`. O nome do arquivo, sem o `.md`, é o **slug** do post e aparece no endereço da página.

## 2. Registre o post na lista

Abra `posts.js` e adicione um item:

```js
{
  slug: 'meu-post',
  title: 'Título do post',
  date: '2026-11-10',
  summary: 'Uma ou duas frases que aparecem na lista.',
  tags: ['devops'],
  featured: false
}
```

Os posts aparecem do mais novo para o mais antigo, pela data.

## Formatação aceita

Títulos com `##` e `###`, texto em **negrito** e *itálico*, `código em linha` e [links](https://www.markdownguide.org/basic-syntax/).

- Listas com hífen
- Também numeradas

> Citações começam com `>`.

Blocos de código usam três crases, com a linguagem logo depois:

```python
def ola(nome: str) -> str:
    return f"Olá, {nome}!"
```

---

Uma linha com `---` cria um separador, como o de cima.
