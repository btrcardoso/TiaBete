# TiaBete

Teste

# Tutoriais
https://business.whatsapp.com/blog/how-to-use-webhooks-from-whatsapp-business-api


primeiro configurei a api e mandei uma mensagem pra meu numero pessoal de telefone.
depois configurei webhooks, colocando a url de callback e injetando um token random. a verificação é feita pelo facebooks.
Aí tem que assinar os eventos de webhook que vc quer.
AO se inscrever em messages, ele vai mandar a mensagem pra o webhook. post("/webhook"



ao adicionar o numero de telefone ele criara uma conta no wpp business e vc tem que adicionar um metodo de pagamento pra gerar o token FB_API_TOKEN. 

É NECESSÁRIO FORNECER PERMISSOES PARA O NUMERO


aqui tem algo de generate accesstoken: https://developers.facebook.com/tools/explorer/


a dica que funcionou é, ao gerar o token, quando for feita a conexao, procurar uma opção que diz (permitir neste e em todos os numeros futuros) e isso fará com que o numero seja realmente ativo. nao faz sentido, mas a api quebrada do facebook funciona assim.