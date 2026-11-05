# ENG4021-33C-Grupo-4-repo

## Como rodar o NEXO (Django)

O projeto Django fica em `Sprint 5/Nexo`. Os comandos abaixo são para o Windows e começam na pasta raiz do repositório.

**1. Criar e ativar o ambiente virtual (venv)**

```
cd "Sprint 5"
python -m venv venv
venv\Scripts\activate
```

Quando o venv está ativo, aparece `(venv)` no começo da linha do terminal. Se o PowerShell bloquear o `activate`, rode uma vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` e tente de novo.

**2. Instalar o Django**

```
pip install -r requirements.txt
```

**3. Criar o banco e carregar os dados de demonstração**

```
cd Nexo
python manage.py migrate
python manage.py loaddata dump.json
```

O `db.sqlite3` não vai para o Git, então cada pessoa cria o seu com o `migrate`. O `dump.json` vai para o Git e coloca os mesmos dados de teste no banco de todo mundo. Se você já tem um `db.sqlite3` antigo, renomeie ou apague ele antes do `migrate`, senão os dados do dump se misturam com os antigos.

**4. Rodar o site**

```
python manage.py runserver
```

Abra http://127.0.0.1:8000/ no navegador. Para parar o servidor, use Ctrl+C no terminal.

**Contas de teste**

Todas usam a senha `nexo2026`. São dados falsos, criados só para testar.

| E-mail | Papel |
|---|---|
| admin@nexo.teste | Administrador (entra no /admin) |
| miguel@nexo.teste | Aluno, PUC-Rio, Engenharia |
| pedro@nexo.teste | Aluno, PUC-Rio, Direito |
| daniel@nexo.teste | Aluno, UFRJ, Economia |
| ana@nexo.teste | Aluno, UERJ, Psicologia |
| beatriz@nexo.teste | Aluno, UFF, Ciência da Computação |
| carla@nexo.teste | Recrutadora, Visagio |
| rafael@nexo.teste | Recrutador, Petrobras |
| lucas@nexo.teste | Representante, PUC-Rio |
| marina@nexo.teste | Representante, Liga de Mercado Financeiro |

**Atenção com as migrations**

Não rode `python manage.py makemigrations --merge` por conta própria. Se o `migrate` acusar conflito de migrations, avise no grupo antes, para não nascer mais de uma migration de merge. Se alguém mudar o `models.py`, também avise no grupo, porque o `dump.json` pode precisar ser refeito.

**Para refazer o dump.json** (só quem estiver cuidando dos dados)

Num banco novo, rode `python manage.py migrate`, depois `python criar_dados_demo.py` e por fim:

```
python -X utf8 manage.py dumpdata auth.user nexoapp --indent 2 -o dump.json
```

O `-X utf8` faz o arquivo ser gravado em UTF-8, que é o formato que o `loaddata` lê. Sem ele, no Windows com Python anterior ao 3.15, os acentos saem em outro formato e o `loaddata` de todo mundo quebra.
