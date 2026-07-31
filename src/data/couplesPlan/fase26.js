// Fase 26 — A volta. 1 e 2 Crônicas (65) + Esdras (10) + Neemias (13) +
// Ester (10): 98 capítulos em 48 dias.
//
// Crônicas reconta o que 1 e 2 Reis (Fase 18) já contaram, mas para quem
// voltou do exílio e precisava saber se ainda era o mesmo povo. Por isso
// muda o foco: menos guerra, mais templo, e uma genealogia de nove capítulos
// para provar que ninguém tinha sumido. Esdras e Neemias são a reconstrução;
// Ester é o que acontecia com quem ficou na Pérsia, no único livro da Bíblia
// em que Deus não é citado uma vez sequer.
//
// Os nove capítulos de genealogia vêm em três dias de três capítulos. Não
// invente aplicação conjugal para lista de nome: ensine o que a lista faz.
//
// Sem par: Esdras 3, Neemias 5 e 6.
//
// Trilha de noivos por exceção, em fase26-noivos.js: 7 dias dos 48.

export const FASE_26 = {
  id: "fase26-a-volta",
  title: "Fase 26 — A volta",
  subtitle: "Crônicas, Esdras, Neemias e Ester: recomeçar sobre ruína conhecida",
  days: [
    {
      readings: ["1 Crônicas 1", "1 Crônicas 2", "1 Crônicas 3"],
      theme: "Nomes antes da história",
      devotional:
        "O livro começa com uma palavra só: Adão. Sem verbo, sem frase, sem explicação — e daí seguem nove capítulos de nomes. Para quem acabou de voltar do exílio, essa lista era um documento: prova de que a família continuava existindo depois de setenta anos fora, de que a linha não tinha sido cortada. Um povo que perdeu terra, templo e rei ainda tinha os nomes. Repare que a genealogia não esconde os torcidos: Er, que foi mau aos olhos do Senhor; Acã, o perturbador; filhos de concubinas, todos anotados. Ninguém foi editado para melhorar o registro. Se alguém fosse escrever a lista da família de vocês, que nomes vocês teriam vontade de omitir — e por quê?",
      prayer:
        "Que aceitemos a nossa família inteira, inclusive os nomes que preferiríamos não citar.",
    },
    {
      readings: ["1 Crônicas 4", "1 Crônicas 5", "1 Crônicas 6"],
      theme: "A oração de Jabez",
      devotional:
        "No meio de centenas de nomes, o texto para de repente e conta uma história de dois versículos. Jabez foi assim chamado porque a mãe o pariu com dor — carregava no nome a lembrança do sofrimento que causou. E ele ora: 'se me abençoares muitíssimo, e meus termos ampliares, e a tua mão for comigo, e fizeres que do mal não seja afligido!'. Um homem marcado pede o contrário do que o nome dele dizia. E o texto encerra sem drama: 'e Deus lhe concedeu o que lhe tinha pedido'. Nada de heroísmo, nada de feito militar — a única coisa registrada sobre ele é que orou. Que nome ou rótulo cada um de vocês carrega desde criança e nunca levou a Deus em oração?",
      prayer:
        "Que aquilo que nos marcou desde cedo seja levado a Deus, em vez de virar explicação para tudo.",
      action:
        "Cada um conte a história do próprio nome — ou do apelido que pegou — e o que ele diz sobre a sua família.",
    },
    {
      readings: ["1 Crônicas 7", "1 Crônicas 8", "1 Crônicas 9"],
      theme: "Os que voltaram primeiro",
      devotional:
        "A genealogia termina onde o leitor original estava: a lista dos que voltaram e se estabeleceram de novo em Jerusalém. E o mais interessante é o que ela registra com cuidado — porteiros, encarregados dos utensílios, os que preparavam as especiarias, os que cuidavam do que era assado em assadeiras, e os cantores, que ficavam livres de outro serviço 'porque de dia e de noite estavam encarregados daquele serviço'. Ninguém ali era famoso. O templo funcionava porque alguém cuidava da farinha e alguém abria o portão. A lista trata isso como digno de registro eterno. Que trabalho invisível sustenta a casa de vocês, e há quanto tempo ninguém o menciona em voz alta?",
      prayer:
        "Que o trabalho invisível da nossa casa seja reconhecido em voz alta, e não só quando falta.",
    },
    {
      readings: ["1 Crônicas 10", "1 Crônicas 11"],
      theme: "A água derramada",
      devotional:
        "O cronista resume o reinado inteiro de Saul em treze versículos e dá o veredicto: morreu por causa da transgressão e porque consultou uma adivinha. Depois começa Davi, e vem uma das cenas mais bonitas do Antigo Testamento. No calor da guerra, Davi comenta, quase para si, que gostaria de beber água do poço de Belém. Três homens rompem o acampamento inimigo, tiram a água e trazem — e ele não bebe. Derrama a água diante do Senhor: 'beberia eu o sangue destes homens com as suas vidas?'. Um desejo dito de passagem custou caro demais, e ele tratou aquilo como sagrado. O que vocês pedem de passagem, sem medir o que custa a quem vai atender?",
      prayer:
        "Que percebamos o preço que o outro paga para atender ao que pedimos sem pensar.",
    },
    {
      readings: ["1 Crônicas 12", "1 Crônicas 13"],
      theme: "Entendidos nos tempos",
      devotional:
        "A lista dos que vieram a Davi em Ziclague descreve cada grupo por sua qualidade: os de Benjamim atiravam com as duas mãos, os de Gade tinham rostos de leão, e os de Issacar aparecem com um elogio de outro tipo — 'destros na ciência dos tempos, para saberem o que Israel devia fazer'. Não eram os mais fortes; sabiam a hora. Depois vem o episódio de Uzá: a arca sendo transportada num carro novo, os bois tropeçam, ele estende a mão para segurar e morre ali. A intenção era boa, o método não era o que estava escrito. Davi fica com medo e para tudo por três meses. Vocês têm feito coisas certas na hora errada, ou do jeito que pareceu mais prático?",
      prayer:
        "Que tenhamos discernimento não só do que fazer, mas de quando e de que jeito.",
    },
    {
      readings: ["1 Crônicas 14", "1 Crônicas 15"],
      theme: "Como está ordenado",
      devotional:
        "Depois de três meses, Davi tenta de novo trazer a arca, e desta vez faz o diagnóstico em voz alta: 'porquanto vós não a levastes na primeira vez, o Senhor nosso Deus fez rotura em nós, porque não o buscamos segundo a ordenança'. Ele estudou o que estava escrito, chamou os levitas, e a arca foi carregada aos ombros, como sempre deveria ter sido. Repare no que mudou entre a primeira e a segunda tentativa: não foi o entusiasmo, foi a obediência ao detalhe. E dá para reparar em outra coisa — entre uma tentativa e outra ele consultou a Deus antes das batalhas, duas vezes, e recebeu respostas diferentes. Em que vocês vêm insistindo com boa intenção e sem nunca perguntar como se faz?",
      prayer:
        "Que a nossa boa intenção venha acompanhada da disposição de aprender o jeito certo.",
    },
    {
      readings: ["1 Crônicas 16", "1 Crônicas 17"],
      theme: "Quem sou eu, Senhor",
      devotional:
        "Com a arca no lugar, Davi organiza o louvor e distribui pão, carne e passas a todo o povo, homens e mulheres. Depois, instalado em casa de cedro, ele decide construir uma casa para Deus — e recebe um não com uma inversão: não serás tu que me farás casa, eu é que te farei casa. A resposta de Davi é a oração de um homem que entendeu o tamanho da coisa: 'quem sou eu, Senhor Deus? E qual é a minha casa, para que me tenhas trazido até aqui?'. Ele queria dar e foi obrigado a receber, o que é bem mais difícil. E aceita que a obra será do filho. O que vocês queriam fazer por Deus, e talvez ele esteja pedindo apenas que vocês recebam?",
      prayer:
        "Que saibamos receber de Deus, mesmo quando preferíamos ser nós a dar.",
    },
    {
      readings: ["1 Crônicas 18", "1 Crônicas 19"],
      theme: "Metade da barba",
      devotional:
        "Davi manda embaixadores consolar Hanum pela morte do pai, e os conselheiros do jovem rei convencem-no de que aquilo é espionagem disfarçada. Hanum então humilha os mensageiros: raspa-lhes a barba pela metade e corta as vestes na altura da coxa, mandando-os de volta. Era uma vergonha calculada: barba cortada, naquele tempo, era humilhação pública que levava meses para desaparecer. E Davi tem o cuidado de mandar dizer que fiquem em Jericó até a barba crescer — protege a dignidade deles antes de pensar em qualquer resposta militar. Um gesto de consolo lido como ameaça gerou uma guerra com dezenas de milhares de mortos. Que gesto de carinho de um de vocês foi interpretado pelo outro como ataque, e nunca foi esclarecido?",
      prayer:
        "Que não transformemos em guerra o que o outro fez tentando nos consolar.",
    },
    {
      readings: ["1 Crônicas 20", "1 Crônicas 21"],
      theme: "O censo que custou",
      devotional:
        "Davi manda contar o povo, e nem Joabe, que não era exatamente uma consciência delicada, concorda: 'por que requer isto o meu senhor?'. Contar os soldados era medir a própria força, e o preço é uma praga que mata setenta mil. Quando o anjo para na eira de Ornã, Davi vai comprar o terreno para levantar um altar. O dono oferece tudo de graça — a eira, os bois, o trigo — e o rei recusa com uma frase que vale por um capítulo: 'não tomarei o que é teu, para o Senhor, para que não ofereça holocausto sem custo'. Adoração de graça, para ele, não valia. O que vocês têm oferecido a Deus que não custou absolutamente nada a vocês?",
      prayer:
        "Que não ofereçamos a Deus apenas aquilo que não nos custa nada.",
    },
    {
      readings: ["1 Crônicas 22", "1 Crônicas 23"],
      theme: "Preparar para quem vem",
      devotional:
        "Davi não construirá o templo, e mesmo assim passa os últimos anos juntando ferro, bronze, cedro e pedra lavrada em quantidade absurda. O motivo é dito com todas as letras: 'Salomão, meu filho, ainda é moço e tenro, e a casa que se há de edificar para o Senhor deve ser magnífica'. Ele trabalha numa obra que não vai ver de pé, para um filho que vai levar o crédito. E instrui Salomão sobre o essencial: só te dê o Senhor prudência e entendimento. Depois organiza os levitas, com função para cada um. Preparar para quem vem depois é a forma mais madura de trabalho. O que vocês estão construindo hoje cujo benefício será de outra pessoa?",
      prayer:
        "Que trabalhemos de boa vontade naquilo cujo resultado outro vai colher.",
    },
    {
      readings: ["1 Crônicas 24", "1 Crônicas 25", "1 Crônicas 26"],
      theme: "Repartidos por sorte",
      devotional:
        "Três capítulos de escalas: sacerdotes divididos em vinte e quatro turnos, cantores organizados por famílias, porteiros sorteados para cada portão — 'assim para o pequeno como para o grande, para o mestre como para o discípulo'. A sorte era lançada para evitar que o cargo dependesse de prestígio ou de quem era filho de quem. E há um detalhe que muda o modo de ler a lista: os cantores são descritos como quem profetiza com harpas e címbalos, e o serviço deles conta como ministério. Organização, aqui, é o que impede que a casa de Deus vire disputa. Quem decide as coisas na casa de vocês — e isso já foi combinado ou só foi acontecendo?",
      prayer:
        "Que as combinações da nossa casa sejam feitas em voz alta, e não impostas pelo costume.",
    },
    {
      readings: ["1 Crônicas 27", "1 Crônicas 28", "1 Crônicas 29"],
      theme: "Da tua mão",
      devotional:
        "Davi se despede em público e entrega a Salomão a planta do templo, dizendo que a recebeu por escrito, da mão do Senhor. E dá ao filho o conselho que resume o livro: 'conhece o Deus de teu pai, e serve-o com um coração perfeito e com uma alma voluntária; porque esquadrinha o Senhor todos os corações'. Depois abre o próprio tesouro particular e o povo se anima e oferece em abundância — 'com coração perfeito, voluntariamente'. E Davi ora com a frase que desmonta qualquer vaidade de doador: 'tudo vem de ti, e do que é teu to damos'. Ninguém deu nada que já não fosse dele. Vocês oferecem a Deus com a sensação de estar dando ou de estar devolvendo?",
      prayer:
        "Que demos com a consciência de que estamos apenas devolvendo o que recebemos.",
    },
    {
      readings: ["2 Crônicas 1", "2 Crônicas 2"],
      theme: "Sabedoria e ciência",
      devotional:
        "Salomão reúne o povo inteiro em Gibeom antes de qualquer decisão de governo, e é ali que Deus oferece o cheque em branco. O pedido dele é preciso: 'dá-me, pois, agora, sabedoria e conhecimento, para que possa sair e entrar perante este povo'. Sabedoria para o trabalho, não para si mesmo. Deus concede, e acrescenta o que não foi pedido. Depois vem a carta a Hirão, rei de Tiro, negociando madeira e operários, com uma frase que Salomão repete quase com espanto: quem sou eu para lhe edificar casa, 'senão para queimar incenso perante ele?'. Ele sabe o tamanho da obra e o tamanho dele. Quando vocês pedem a Deus, pedem para render mais ou para servir melhor?",
      prayer:
        "Que os nossos pedidos a Deus tenham em vista o serviço, e não apenas o nosso conforto.",
    },
    {
      readings: ["2 Crônicas 3", "2 Crônicas 4"],
      theme: "Duas colunas com nome",
      devotional:
        "A descrição do templo é minuciosa: medidas, ouro, querubins, o véu de azul, púrpura e carmesim. E no fim das obras, duas colunas de bronze são levantadas na frente, e o texto anota que elas receberam nome próprio — Jaquim, que quer dizer ele estabelecerá, e Boaz, nele há força. Duas colunas que não sustentavam o teto: eram declarações em pé, à vista de quem chegava. Toda a estrutura do templo foi projetada para dizer alguma coisa antes de qualquer palavra ser pronunciada ali dentro. O mar de bronze sobre doze bois, as dez pias, o pátio — tudo comunica. O que a casa de vocês comunica a quem entra, sem que ninguém precise explicar nada?",
      prayer:
        "Que a nossa casa fale de Deus antes que a gente abra a boca para falar dele.",
    },
    {
      readings: ["2 Crônicas 5", "2 Crônicas 6"],
      theme: "Como um só som",
      devotional:
        "Na dedicação do templo, os músicos e cantores fazem uma coisa que o texto descreve com cuidado: tocavam 'uniformemente', para 'fazerem ouvir uma só voz', louvando porque ele é bom e a sua benignidade dura para sempre. E é nesse momento, não antes, que a nuvem enche a casa e os sacerdotes não conseguem continuar em pé. A glória chega quando muita gente vira um som só. Depois Salomão ora de joelhos, de mãos estendidas, e a oração é toda sobre o futuro: quando pecarem, quando forem derrotados, quando não chover, quando forem levados cativos — 'ouve tu desde os céus, e perdoa'. Onde vocês dois ainda tocam cada um a sua música, sem nunca virar um som?",
      prayer:
        "Que aprendamos a soar como uma voz só, sem que nenhum de nós precise se calar.",
      action:
        "Cantem ou orem juntos em voz alta hoje, os dois ao mesmo tempo, ainda que soe estranho no começo.",
    },
    {
      readings: ["2 Crônicas 7", "2 Crônicas 8"],
      theme: "Se o meu povo",
      devotional:
        "Fogo desce, a glória enche a casa, e o povo se prostra sobre o pavimento. Depois, de noite, Deus aparece a Salomão e diz a frase que virou versículo de placa: 'se o meu povo, que se chama pelo meu nome, se humilhar, e orar, e buscar a minha face e se converter dos seus maus caminhos, então eu ouvirei dos céus'. Repare que ela vem logo depois do aviso de que haverá seca, gafanhoto e peste — a promessa é para o tempo ruim, não para o bom. E são quatro verbos exigidos antes do perdão: humilhar, orar, buscar, converter. Nenhum deles é automático. Que oração de vocês vem sendo repetida sem nenhuma mudança de caminho junto?",
      prayer:
        "Que as nossas orações venham acompanhadas de mudança, e não apenas de repetição.",
    },
    {
      readings: ["2 Crônicas 9", "2 Crônicas 10"],
      theme: "Os que cresceram comigo",
      devotional:
        "A rainha de Sabá vem de longe, faz as perguntas difíceis, vê tudo e conclui que não lhe contaram nem a metade. Salomão morre no auge. E aí o reino se parte por causa de uma conversa. O povo pede alívio da carga, Roboão consulta os anciãos que serviram a seu pai, ouve o conselho de aliviar — e então 'deixou o conselho que os anciãos lhe deram; e tomou conselho com os jovens, que haviam crescido com ele'. Escolheu os que pensavam como ele. A resposta é uma bravata, e dez tribos vão embora para sempre. Quando vocês pedem conselho, procuram quem vai discordar ou quem já concorda de antemão?",
      prayer:
        "Que busquemos conselho de quem tem coragem de discordar de nós.",
      action:
        "Cada um pense numa decisão recente e responda: eu procurei conselho ou procurei aprovação?",
    },
    {
      readings: ["2 Crônicas 11", "2 Crônicas 12"],
      theme: "Escudos de bronze",
      devotional:
        "Roboão se fortalece por três anos, e o texto diz que 'quando já tinha estabelecido o reino e se tinha fortalecido, deixou a lei do Senhor'. Vem então Sisaque, rei do Egito, e leva os tesouros do templo e do palácio, inclusive os escudos de ouro que Salomão mandara fazer. E Roboão faz o que qualquer um faria: manda fabricar escudos de bronze no lugar, e os guardas continuam desfilando com eles como se nada tivesse mudado. A cerimônia segue idêntica; só o material é que virou imitação. Ninguém de fora percebia. Que rotina da vida de vocês continua acontecendo exatamente igual, mas já não tem mais o ouro que tinha no começo?",
      prayer:
        "Que percebamos quando o que fazemos virou bronze, em vez de fingir que ainda é ouro.",
    },
    {
      readings: ["2 Crônicas 13", "2 Crônicas 14"],
      theme: "Nada é para ti",
      devotional:
        "Abias enfrenta um exército do dobro do tamanho e, cercado por dois lados, o povo clama e os sacerdotes tocam as trombetas. Depois Asa, com um milhão de inimigos à frente, faz uma oração curta que é uma pequena obra de teologia: 'Senhor, nada para ti é ajudar, quer o poderoso quer o de nenhuma força; ajuda-nos, pois, Senhor nosso Deus, porque em ti confiamos'. Para Deus não existe caso difícil e caso fácil — a diferença de tamanho só existe para nós. E Asa, nos primeiros anos, tira os altares estranhos e manda o povo buscar ao Senhor. O que vocês classificaram como grande demais para levar a Deus em oração?",
      prayer:
        "Que nada nos pareça grande demais nem pequeno demais para levar a Deus.",
    },
    {
      readings: ["2 Crônicas 15", "2 Crônicas 16"],
      theme: "Os olhos que correm",
      devotional:
        "O profeta Azarias dá a Asa uma palavra que serve de resumo do livro: 'o Senhor está convosco, enquanto vós estais com ele; e, se o buscardes, o achareis'. Asa reforma o reino e chega a destituir a própria avó por causa de um ídolo. Mas trinta e cinco anos depois, ameaçado, ele compra a ajuda da Síria com a prata do templo — e o vidente Hanani vem dizer: 'quanto ao Senhor, seus olhos passam por toda a terra, para mostrar-se forte para com aqueles cujo coração é perfeito'. Asa se irrita e prende o profeta. Depois adoece dos pés e 'não buscou ao Senhor, mas antes os médicos'. Vocês procuram Deus primeiro ou só quando as outras portas já fecharam?",
      prayer:
        "Que Deus não seja o último recurso da nossa lista quando algo dá errado.",
    },
    {
      readings: ["2 Crônicas 17", "2 Crônicas 18"],
      theme: "Ajudar ao ímpio",
      devotional:
        "Josafá começa muito bem: manda príncipes, levitas e sacerdotes percorrerem as cidades ensinando a lei, com o livro na mão. O reino prospera. E então ele faz a pior escolha do reinado — casa o filho com a família de Acabe e desce para uma aliança militar. No meio da consulta aos quatrocentos profetas que dizem sim, ele é o único a perguntar se não há mais nenhum profeta do Senhor ali, e mesmo depois de ouvir o não de Micaías, vai assim mesmo. Escapa por pouco, e o vidente o recebe na volta com a pergunta: 'devias tu ajudar ao ímpio, e amar aqueles que odeiam ao Senhor?'. Com quem vocês vêm se associando por conveniência, ouvindo por dentro que não é bom?",
      prayer:
        "Que tenhamos coragem de recusar sociedades convenientes que sabemos serem erradas.",
    },
    {
      readings: ["2 Crônicas 19", "2 Crônicas 20"],
      theme: "Nossos olhos em ti",
      devotional:
        "Josafá organiza juízes e manda a eles um recado que vale para qualquer autoridade: não julgais da parte do homem, mas do Senhor. Depois chega a notícia de que três exércitos vêm juntos, e ele reúne o povo — inclusive as crianças — e faz uma oração que termina numa confissão de impotência absoluta: 'em nós não há força perante esta grande multidão que vem contra nós, e não sabemos o que faremos; porém os nossos olhos estão postos em ti'. A resposta vem por um levita no meio da assembleia. E de manhã ele põe os cantores na frente do exército. Louvor antes da vitória. Vocês conseguem dizer em voz alta, um para o outro, que não sabem o que fazer?",
      prayer:
        "Que possamos admitir que não sabemos o que fazer, sem que isso pareça fraqueza.",
      action:
        "Cada um diga uma situação em que está perdido de verdade. Orem por ela sem propor solução.",
    },
    {
      readings: ["2 Crônicas 21", "2 Crônicas 22"],
      theme: "Sem deixar saudade",
      devotional:
        "Jeorão começa o reinado matando os próprios irmãos, casa-se com a filha de Acabe e conduz Judá à idolatria. Adoece dos intestinos por dois anos, morre em dores, e o cronista escreve o epitáfio mais duro da Bíblia: 'e foi sem deixar de si saudades; e sepultaram-no na cidade de Davi, porém não nos sepulcros dos reis'. Ninguém sentiu falta. Depois vem Acazias, aconselhado pela mãe 'para proceder impiamente', e por fim Atalia, que manda matar todos os netos para reinar — e só falha porque uma tia esconde um bebê no templo por seis anos. Que diferença vocês querem que a ausência de vocês faça na vida de quem convive com vocês?",
      prayer:
        "Que a nossa passagem por esta vida deixe saudade em quem conviveu conosco.",
    },
    {
      readings: ["2 Crônicas 23", "2 Crônicas 24"],
      theme: "Enquanto Joiada viveu",
      devotional:
        "Joás é coroado aos sete anos, protegido pelo sacerdote Joiada, e restaura o templo com uma caixa de ofertas posta na porta, onde o povo deposita com alegria. Tudo vai bem — e o texto explica exatamente até quando: 'fez Joás o que era reto aos olhos do Senhor, todos os dias do sacerdote Joiada'. Morto o velho sacerdote, os príncipes de Judá bajulam o rei, ele os ouve, volta aos ídolos, e quando o filho de Joiada o repreende, manda apedrejá-lo no pátio do templo. Matou o filho de quem o salvou. Fé emprestada dura o tempo de quem a empresta. A fé de vocês se sustenta sozinha, ou depende de alguém específico continuar por perto?",
      prayer:
        "Que a nossa fé não dependa de uma pessoa só continuar viva ou por perto.",
    },
    {
      readings: ["2 Crônicas 25", "2 Crônicas 26"],
      theme: "Quando se fortaleceu",
      devotional:
        "Amazias faz o que é reto, 'porém não com coração perfeito', e o detalhe aparece rápido: contrata mercenários, é avisado a dispensá-los, chora pelo dinheiro perdido, obedece — e depois traz para casa os deuses dos inimigos que acabou de derrotar, adorando os ídolos de quem perdeu. Uzias vem em seguida e prospera de um jeito impressionante, com engenhos de guerra inventados por homens hábeis. E então: 'havendo-se já fortificado, exaltou-se o seu coração até se corromper'. Ele entra no templo para queimar incenso, papel que não era dele, e sai leproso. O sucesso deu nele. O que na vida de vocês vem indo bem a ponto de já não pedirem opinião a ninguém?",
      prayer:
        "Que a força que conquistamos não nos convença de que já podemos dispensar limites.",
    },
    {
      readings: ["2 Crônicas 27", "2 Crônicas 28"],
      theme: "Fechou as portas",
      devotional:
        "Jotão tem um dos resumos mais bonitos do livro: 'tornou-se poderoso, porque dirigiu os seus caminhos na presença do Senhor seu Deus'. Reinou dezesseis anos e quase não rendeu história. Depois vem Acaz, e a queda é vertiginosa: sacrifica os próprios filhos, adota os deuses da Síria alegando que ajudaram os outros, e faz o gesto final — 'fez em pedaços os utensílios da casa de Deus, e fechou as portas da casa do Senhor', montando altares em cada esquina de Jerusalém. Não destruiu o templo, só trancou. No meio do capítulo, os inimigos tratam os prisioneiros com mais misericórdia que os irmãos. Que porta vocês fecharam sem arrombar nada, apenas deixando de abrir?",
      prayer:
        "Que nenhuma porta importante da nossa vida seja fechada apenas por desuso.",
    },
    {
      readings: ["2 Crônicas 29", "2 Crônicas 30"],
      theme: "Fora do prazo",
      devotional:
        "Ezequias abre as portas do templo no primeiro mês do primeiro ano do reinado — não esperou consolidar poder. Manda limpar tudo, e os levitas tiram a sujeira acumulada durante anos. Depois quer celebrar a páscoa, e descobre um problema: não havia sacerdotes santificados suficientes nem gente reunida a tempo. Então toma uma decisão incomum: celebra no segundo mês, fora da data, e ainda convida as tribos do norte, que zombam dos mensageiros. Muitos comem a páscoa sem estar cerimonialmente puros, e ele ora pedindo que Deus perdoe todo aquele que preparou o coração. Deus ouve. Que coisa boa vocês vêm adiando por achar que já passou da data certa?",
      prayer:
        "Que Deus olhe para o coração preparado, mesmo quando chegamos fora do prazo.",
    },
    {
      readings: ["2 Crônicas 31", "2 Crônicas 32"],
      theme: "Deixou-o para prová-lo",
      devotional:
        "Ezequias organiza as ofertas e o povo traz tanto que sobram montes no pátio. Depois vem Senaqueribe, com propaganda psicológica escrita em cartas, e o rei responde tapando as fontes de água, reforçando o muro e dizendo ao povo: 'conosco está o Senhor nosso Deus, para nos ajudar'. O anjo resolve a guerra. E então vem o versículo mais desconcertante do capítulo: quando os embaixadores da Babilônia chegam, 'Deus o desamparou, para tentá-lo, para saber tudo o que havia no seu coração'. Deus solta a mão de propósito, e o que estava escondido no coração aparece na hora da vaidade, não na hora do cerco. Vocês se conhecem melhor na crise ou no sucesso?",
      prayer:
        "Que o que está escondido no nosso coração seja tratado antes de ser exposto.",
    },
    {
      readings: ["2 Crônicas 33", "2 Crônicas 34"],
      theme: "Manassés se humilhou",
      devotional:
        "Manassés é o pior rei de Judá: altares em toda parte, filhos passados pelo fogo, feitiçaria, um ídolo dentro do templo, cinquenta e cinco anos de estrago. E aí o cronista conta o que 2 Reis não contou — levado com ganchos e correntes para a Babilônia, 'ele, angustiado, orou deveras ao Senhor seu Deus, e humilhou-se muito'. Deus ouve, e ele volta ao trono e passa os últimos anos desmontando o que construiu. Não desfez tudo: o povo continuou sacrificando nos altos. Arrependimento verdadeiro nem sempre apaga as consequências. Depois vem Josias, que aos oito anos começa a reinar e aos vinte e seis acha o livro perdido. Que estrago de vocês ainda está sendo desmontado aos poucos?",
      prayer:
        "Que nenhuma história nossa seja considerada tarde demais para virar.",
    },
    {
      readings: ["2 Crônicas 35", "2 Crônicas 36"],
      theme: "Até não haver remédio",
      devotional:
        "Josias celebra a maior páscoa desde Samuel e morre cedo, numa guerra que não era dele, depois de ignorar um aviso vindo do lugar mais improvável — a boca de um rei estrangeiro. Depois dele, quatro reis em vinte e três anos, cada um pior, até a frase que fecha a história de Judá: Deus enviou mensageiros de madrugada, 'eles, porém, zombaram dos mensageiros de Deus, e desprezaram as suas palavras... até que o furor do Senhor tanto subiu contra o seu povo, que mais nenhum remédio houve'. E o livro termina, contra toda a expectativa, com o decreto de Ciro mandando o povo voltar e reconstruir. Que aviso vocês vêm ouvindo há tempo e tratando como exagero de quem fala?",
      prayer:
        "Que ouçamos o aviso enquanto ele ainda pode mudar alguma coisa.",
    },
    {
      readings: ["Esdras 1", "Esdras 2"],
      theme: "O que Ciro anunciou",
      devotional:
        "Um rei persa que não adorava o Deus de Israel assina um decreto mandando reconstruir o templo, e o texto diz que o Senhor despertou o espírito dele. O convite é aberto e voluntário: 'quem há entre vós, de todo o seu povo... e suba a Jerusalém'. Setenta anos depois, quem voltou foi minoria — a maioria já tinha casa, negócio e vida montada na Babilônia, e voltar significava ruína, obra e insegurança. E os que foram são contados por família, com uma anotação curiosa: alguns não conseguiram provar a genealogia e ficaram de fora do sacerdócio. Sair do conforto para reconstruir escombro nunca é decisão fácil. Que recomeço vocês vêm adiando porque o que já está montado é confortável?",
      prayer:
        "Que o conforto do que já está montado não nos impeça de recomeçar onde é preciso.",
    },
    {
      readings: ["Esdras 3"],
      theme: "Choro e alegria juntos",
      devotional:
        "Antes de qualquer parede, eles levantam o altar — no lugar antigo, apesar do medo dos povos em volta — e recomeçam os sacrifícios. Depois lançam os fundamentos, e acontece uma cena que o texto descreve com cuidado: os jovens gritam de alegria e 'muitos dos sacerdotes, e levitas e chefes dos pais, já idosos, que viram a primeira casa, choraram em altas vozes'. Os velhos comparavam com o templo de Salomão e viam o tamanho da perda; os novos viam um começo. 'Não discernia o povo as vozes do júbilo de alegria das vozes do choro.' Um som só, feito de duas emoções opostas. Onde vocês estão comemorando o que o outro ainda está chorando?",
      prayer:
        "Que respeitemos o choro do outro mesmo quando estamos com vontade de comemorar.",
      action:
        "Perguntem um ao outro: tem alguma perda deste último ano que eu tratei como se já estivesse superada?",
    },
    {
      readings: ["Esdras 4", "Esdras 5"],
      theme: "A obra parou",
      devotional:
        "A oposição chega primeiro como oferta de ajuda — 'edificaremos convosco' — e, recusada, vira desânimo, intimidação e por fim uma carta bem escrita ao rei, alegando que aquela cidade sempre foi rebelde. A ordem de embargo chega, e o texto anota o resultado: 'então cessou a obra da casa de Deus'. Ficou parada dezesseis anos. O que a violência não conseguiu, a burocracia conseguiu. E o que reinicia a obra não é uma nova autorização: são dois profetas, Ageu e Zacarias, pregando. Os construtores voltam ao trabalho ainda sem permissão, e a permissão vem depois. Que projeto bom de vocês parou por causa de um obstáculo que ninguém nunca mais foi conferir se continua ali?",
      prayer:
        "Que voltemos ao que foi deixado pela metade, em vez de tratar a interrupção como sentença.",
    },
    {
      readings: ["Esdras 6", "Esdras 7"],
      theme: "Preparou o coração",
      devotional:
        "A busca nos arquivos encontra o decreto original de Ciro, e Dario não só confirma como manda pagar a obra com o dinheiro dos impostos da região — os adversários passam a financiar o templo. A casa é terminada com alegria, e a páscoa é celebrada. Depois entra Esdras, e o texto explica o segredo dele numa frase que descreve uma vida inteira: 'Esdras tinha preparado o seu coração para buscar a lei do Senhor e para cumpri-la e para ensinar em Israel'. A ordem importa — buscar, cumprir, depois ensinar. Quem ensina o que não pratica ensina outra coisa. O que vocês têm ensinado aos outros, com palavras ou por exemplo, e ainda não cumpriram dentro de casa?",
      prayer:
        "Que cumpramos primeiro o que pretendemos ensinar a alguém.",
    },
    {
      readings: ["Esdras 8", "Esdras 9"],
      theme: "Envergonhado de pedir",
      devotional:
        "Esdras vai levar uma caravana com ouro e prata do rei por uma estrada cheia de assaltantes, e faz uma escolha que ele mesmo explica sem heroísmo: 'tive vergonha de pedir ao rei exército e cavaleiros para nos defenderem', porque tinha dito ao rei que a mão de Deus está sobre os que o buscam. Ele proclama um jejum, ora, e vai sem escolta — não por ousadia, mas por coerência com o que havia dito. Depois, ao saber dos casamentos com os povos vizinhos, rasga as vestes, arranca cabelo e barba e senta atônito, e a oração dele não diz 'eles', diz 'nós'. Vocês têm coragem de sustentar na prática aquilo que dizem crer em conversa?",
      prayer:
        "Que o que dizemos crer nos obrigue a viver de acordo, mesmo quando ninguém conferiria.",
    },
    {
      readings: ["Esdras 10"],
      theme: "Ainda há esperança",
      devotional:
        "É um capítulo duro, e não adianta suavizar: sob chuva, a assembleia decide que os homens que se casaram com mulheres estrangeiras devem despedi-las, com os filhos. O texto lista os nomes um a um. Ninguém deve ler isso como modelo de conduta conjugal — o Novo Testamento manda o contrário, que o crente permaneça casado com quem não crê. O que aquele povo enfrentava era um risco de dissolução: eram poucos milhares recém-voltados, e a fé inteira podia desaparecer em uma geração. A frase que abre a decisão é a única esperança do capítulo: 'no tocante a isto, ainda há esperança para Israel'. Que decisão vocês já tomaram com boa intenção e que feriu alguém no caminho?",
      prayer:
        "Que as nossas decisões corretas não sejam tomadas de um jeito que atropele pessoas.",
    },
    {
      readings: ["Neemias 1", "Neemias 2"],
      theme: "Perguntei pelos que ficaram",
      devotional:
        "Neemias é copeiro do rei, cargo de conforto e confiança, e tudo começa porque ele pergunta por gente que ele não conhece: quis saber dos que restaram do cativeiro e da cidade. A resposta — muro fendido, portas queimadas, povo em miséria — o faz chorar, jejuar e orar por dias. Depois ele age com estranha frieza prática: escolhe a hora, pede prazo, pede cartas para a madeira. Chegando, sai de noite, sozinho, e inspeciona o muro sem contar a ninguém antes de propor a obra. Oração longa e planejamento detalhado no mesmo homem. Vocês perguntam de verdade como estão as pessoas, ou já esperam a resposta automática de sempre?",
      prayer:
        "Que a nossa pergunta sobre como alguém está seja de verdade, e que a resposta nos mova.",
    },
    {
      readings: ["Neemias 3", "Neemias 4"],
      theme: "Defronte da sua casa",
      devotional:
        "O capítulo 3 é uma lista de quem construiu o quê, e o método aparece repetido: cada um trabalhou no trecho em frente à própria casa. Ourives, perfumistas, sacerdotes e filhas de Salum — ninguém era pedreiro, todos levantaram o pedaço que enxergavam da porta. Um único grupo é constrangido para sempre: 'os seus nobres não meteram o pescoço na obra do seu Senhor'. Depois vêm as ameaças, o desânimo — 'as forças dos carregadores desfaleceram' —, e a solução de Neemias é organizar por famílias e armar todo mundo: 'cada um com uma das mãos fazia a obra e na outra tinha as armas'. Qual é o pedaço de muro que fica exatamente em frente à casa de vocês?",
      prayer:
        "Que trabalhemos primeiro no pedaço que está em frente à nossa própria porta.",
    },
    {
      readings: ["Neemias 5"],
      theme: "A usura entre irmãos",
      devotional:
        "No meio da obra estoura um problema interno pior que o inimigo externo: famílias hipotecando terras e vendendo filhos para comprar trigo, e quem estava cobrando eram os próprios irmãos judeus. Neemias diz que considerou aquilo no coração antes de agir — pensou antes de brigar — e então convoca uma assembleia e enfrenta os nobres: 'sois usurários cada um para com seu irmão'. Manda devolver terras, casas e a centésima parte cobrada. E dá o exemplo pessoal: sendo governador, não comeu do pão do governo, e ainda sustentou cento e cinquenta pessoas à sua mesa. Autoridade que abre mão. Em que vocês vêm cobrando de quem está por perto um preço que não cobrariam de um estranho?",
      prayer:
        "Que não sejamos duros com os nossos justamente onde somos generosos com estranhos.",
    },
    {
      readings: ["Neemias 6"],
      theme: "Faço uma grande obra",
      devotional:
        "Quatro convites para uma reunião na planície de Ono, e Neemias responde a mesma coisa quatro vezes: 'faço uma grande obra, de modo que não poderei descer; por que cessaria esta obra, enquanto eu a deixasse, e fosse ter convosco?'. Não é arrogância, é foco — ele sabia que a reunião era armadilha. Depois vem a carta aberta com boato, e por fim o golpe mais sutil: um profeta pago sugere que ele se esconda no templo para salvar a vida, e ele percebe que aquilo o desqualificaria. O muro fica pronto em cinquenta e dois dias. O que anda tirando vocês da obra que importa, sempre com um bom motivo e um convite educado?",
      prayer:
        "Que saibamos dizer não ao que nos tira do que Deus nos deu para fazer.",
      action:
        "Cada um identifique um compromisso que aceitou por educação e que vem drenando o tempo de casa.",
    },
    {
      readings: ["Neemias 7", "Neemias 8"],
      theme: "A alegria do Senhor",
      devotional:
        "Com o muro pronto, o povo pede uma coisa que ninguém mandou: que Esdras traga o livro da lei. Ficam em pé de manhã até o meio-dia ouvindo, e os levitas explicam o sentido, para que entendessem a leitura. E o povo começa a chorar, porque entendeu o quanto estava longe. Aí Neemias os impede de chorar: aquele dia é santo, 'ide, comei as gorduras, e bebei as doçuras, e enviai porções aos que não têm nada preparado para si... porque a alegria do Senhor é a vossa força'. A ordem inclui mandar comida para quem não tinha. Alegria com endereço. O que vocês entenderam sobre Deus nesta fase e ainda não virou alegria nem gesto concreto?",
      prayer:
        "Que o que aprendemos de Deus vire alegria e comida na mesa de alguém.",
    },
    {
      readings: ["Neemias 9", "Neemias 10"],
      theme: "Fizemos firme acordo",
      devotional:
        "O povo jejua, se reúne e passa um quarto do dia lendo e outro quarto confessando. A oração que fazem é a recapitulação mais honesta do Antigo Testamento: tu fizeste, tu deste, tu sustentaste — 'porém eles e os nossos pais se ensoberbeceram'. Repetem o ciclo inteiro sem álibi, e reconhecem que Deus foi justo em tudo o que veio sobre eles. E então não terminam em emoção: 'fizemos uma firme aliança, e o escrevemos; e selaram-no os nossos príncipes, os nossos levitas e os nossos sacerdotes'. Puseram no papel, com nome e selo, compromissos concretos sobre casamento, sábado, dívidas e ofertas. Que decisão de vocês precisaria sair da conversa e virar combinado por escrito?",
      prayer:
        "Que as nossas decisões saiam da emoção e virem compromisso com data e palavra dada.",
      action:
        "Escrevam num papel um compromisso concreto que os dois assumem a partir de hoje. Assinem os dois.",
    },
    {
      readings: ["Neemias 11", "Neemias 12", "Neemias 13"],
      theme: "Lembra-te de mim",
      devotional:
        "Jerusalém estava vazia por dentro, e a solução é sorteio: um de cada dez vem morar na cidade, e o texto abençoa 'todos os homens que voluntariamente se ofereceram para habitar em Jerusalém'. Depois vem a dedicação do muro, com dois coros andando em direções opostas sobre a muralha até se encontrarem, e a alegria ouvida de longe. E aí Neemias viaja. Quando volta, encontra o sacerdote alojando um inimigo numa sala do templo, os levitas sem sustento e voltando à roça, negócio no sábado e crianças que já não sabiam falar a língua do próprio povo. Ele desfaz tudo, e ora quatro vezes: 'lembra-te de mim, Deus meu'. O que na casa de vocês só se mantém com manutenção constante?",
      prayer:
        "Que não confundamos uma conquista com algo que dispensa manutenção.",
    },
    {
      readings: ["Ester 1", "Ester 2"],
      theme: "Vasti disse não",
      devotional:
        "Um banquete de cento e oitenta dias termina com o rei bêbado mandando trazer a rainha para exibir a beleza dela aos convidados. 'Porém a rainha Vasti recusou vir.' O império inteiro entra em pânico com esse não, e os conselheiros convencem o rei a publicar um decreto em todas as províncias para que as mulheres honrem os maridos — uma lei feita por homens com medo. Vasti é deposta, e começa a busca por outra: moças recolhidas ao harém, doze meses de preparo, uma noite com o rei. Ester entra nesse processo escondendo a origem, por ordem de Mardoqueu. Em nenhuma linha Deus é citado neste livro. O que da história de vocês foi decidido por outras pessoas, sem que ninguém perguntasse?",
      prayer:
        "Que Deus aja na nossa história inclusive nas partes que não escolhemos.",
    },
    {
      readings: ["Ester 3", "Ester 4"],
      theme: "Para tal tempo",
      devotional:
        "Hamã se ofende porque um homem não se curva, e transforma isso num projeto de extermínio, vendido ao rei com um argumento que se repetiria na história: 'existe espalhado e dividido entre os povos... um povo, cujas leis são diferentes'. Sorteia-se a data, e o decreto sai. Mardoqueu põe pano de saco e manda um recado a Ester que é uma das falas mais duras da Bíblia: se te calares neste tempo, socorro virá de outra parte, 'mas tu e a casa de teu pai perecereis; e quem sabe se para tal tempo como este chegaste a este reino?'. Ela pede jejum de três dias e decide: se perecer, pereci. Que silêncio vocês vêm mantendo por medo do custo de falar?",
      prayer:
        "Que não fiquemos calados na hora exata em que a nossa palavra faria diferença.",
      action:
        "Cada um nomeie uma situação em que vem se calando por medo. Decidam juntos o próximo passo.",
    },
    {
      readings: ["Ester 5", "Ester 6"],
      theme: "A noite sem sono",
      devotional:
        "Ester entra sem ser chamada, arriscando a vida, e o cetro é estendido. E então ela não fala nada: convida o rei e Hamã para um banquete, e no banquete convida para outro. Ganha tempo. Hamã sai eufórico, cruza com Mardoqueu e manda erguer uma forca de vinte e dois metros. E aí vem a virada mais sutil da Bíblia: 'naquela mesma noite fugiu o sono do rei', que manda ler as crônicas do reino e descobre que Mardoqueu nunca foi recompensado. Um insônia. Nenhum milagre, nenhum anjo, nenhuma menção a Deus — e tudo muda. Na manhã seguinte, Hamã é obrigado a honrar o homem que queria enforcar. Que coincidências da vida de vocês talvez não tenham sido coincidência?",
      prayer:
        "Que reconheçamos a mão de Deus também no que parece apenas coincidência.",
    },
    {
      readings: ["Ester 7", "Ester 8"],
      theme: "A forca que preparou",
      devotional:
        "No segundo banquete, Ester finalmente fala, e a acusação é pessoal: fomos vendidos, eu e o meu povo. O rei sai furioso ao jardim, volta e encontra Hamã caído sobre o divã de Ester implorando pela vida — e interpreta como ataque. Um camareiro comenta que há uma forca de cinquenta côvados no quintal dele, e o texto fecha o círculo: 'enforcaram, pois, a Hamã na forca, que ele tinha preparado para Mardoqueu'. Mas o decreto contra os judeus não podia ser revogado, porque lei do rei não se desfaz; a solução é outra carta, dando-lhes o direito de se defender. Nem toda armadilha se desmonta: às vezes só se dá arma a quem estava indefeso. Que armadilha vocês vêm montando para alguém?",
      prayer:
        "Que não preparemos para ninguém aquilo que não gostaríamos de encontrar no nosso caminho.",
    },
    {
      readings: ["Ester 9", "Ester 10"],
      theme: "A sorte que virou",
      devotional:
        "Os judeus se defendem e vencem, e o texto faz questão de repetir três vezes que não puseram a mão no despojo — não era saque, era sobrevivência. E a festa criada para lembrar disso recebe o nome do sorteio que Hamã fez para escolher a data do extermínio: Purim, de pur, sorte. A data escolhida para matá-los virou o feriado da libertação. E as instruções da festa incluem o que ela não pode deixar de ter: 'de mandarem presentes uns aos outros, e dádivas aos pobres'. Alegria com endereço, de novo. Deus não é citado nenhuma vez no livro inteiro, e está em cada página. Onde vocês reconhecem, olhando para trás, que a sorte de vocês virou sem que ninguém percebesse na hora?",
      prayer:
        "Que saibamos contar depois o que não conseguimos enxergar enquanto estava acontecendo.",
      action:
        "Contem um ao outro um episódio antigo que parecia ruim e hoje vocês entendem de outro jeito.",
    },
  ].map((d, i) => ({ ...d, day: i + 1 })),
};
