// Lista de posts do blog. Para publicar um post novo:
// 1. crie o arquivo posts/<slug>.md com o conteúdo em Markdown;
// 2. adicione um item abaixo com o mesmo slug.
// featured: true coloca o post na seção "Em destaque" (até 3).
// image: capa do card na página Blog, por exemplo 'assets/posts/bem-vindo.jpg' (2:1, ~1200x600).
//        Sem image, o card mostra uma capa gerada com o título.
window.POSTS = [
  {
    slug: 'bem-vindo',
    title: 'Bem-vindo ao blog',
    date: '2026-11-07',
    summary: 'Por que este blog existe, o que você vai encontrar aqui e como ele foi construído.',
    tags: ['blog'],
    featured: true
  },
  {
    slug: 'docker-multi-stage',
    image: 'assets/posts/docker-multi-stage.jpg',
    title: 'Imagens Docker menores com build multi-stage',
    date: '2026-11-05',
    summary: 'Separe compilação e execução em estágios diferentes e envie para produção só o que a aplicação precisa.',
    tags: ['docker', 'devops'],
    featured: true
  },
  {
    slug: 'anatomia-deployment-kubernetes',
    title: 'Anatomia de um Deployment no Kubernetes',
    date: '2026-11-02',
    summary: 'Réplicas, seletores, template e estratégia de atualização: o que cada parte do manifesto faz.',
    tags: ['kubernetes', 'devops'],
    featured: true
  },
  {
    slug: 'como-publicar-um-post',
    title: 'Como publicar um post neste blog',
    date: '2026-10-30',
    summary: 'Guia rápido do formato Markdown aceito aqui, com exemplos de títulos, listas, citações e código.',
    tags: ['blog', 'markdown']
  }
];
