class CadastroRecrutadorForm(forms.Form):
    nome = forms.CharField(
        label="Nome completo",
        max_length=100
    )

    email = forms.EmailField(
        label="E-mail corporativo"
    )

    cargo = forms.CharField(
        label="Cargo ou função",
        max_length=100
    )

    senha = forms.CharField(
        label="Senha",
        min_length=8,
        widget=forms.PasswordInput(
            attrs={"placeholder": "Mínimo de 8 caracteres"}
        )
    )

    empresa = forms.ChoiceField(
        label="Empresa",
        choices=[("", "Selecione")]
    )

    aceita_termos = forms.BooleanField(
        label="Aceito os termos e a política de privacidade",
        required=True
    )


class CadastroRepresentanteForm(forms.Form):
    nome = forms.CharField(
        label="Nome completo",
        max_length=100
    )

    email = forms.EmailField(
        label="E-mail corporativo"
    )

    cargo = forms.CharField(
        label="Cargo ou função",
        max_length=100
    )

    senha = forms.CharField(
        label="Senha",
        min_length=8,
        widget=forms.PasswordInput(
            attrs={"placeholder": "Mínimo de 8 caracteres"}
        )
    )

    empresa = forms.ChoiceField(
        label="Empresa",
        choices=[("", "Selecione")]
    )

    aceita_termos = forms.BooleanField(
        label="Aceito os termos e a política de privacidade",
        required=True
    )
    class CadastroAlunoForm(forms.Form):
    nome_completo = forms.CharField(
        label="Nome completo",
        max_length=150,
        widget=forms.TextInput(attrs={
            "placeholder": "Digite seu nome completo",
            "class": "form-control",
        })
    )

    email_academico = forms.EmailField(
        label="E-mail acadêmico",
        widget=forms.EmailInput(attrs={
            "placeholder": "seu.email@aluno.universidade.br",
            "class": "form-control",
        })
    )

    senha = forms.CharField(
        label="Senha",
        min_length=8,
        widget=forms.PasswordInput(attrs={
            "placeholder": "Mínimo de 8 caracteres",
            "class": "form-control",
        })
    )

    matricula = forms.CharField(
        label="Matrícula",
        max_length=20,
        widget=forms.TextInput(attrs={
            "placeholder": "Digite sua matrícula",
            "class": "form-control",
        })
    )

    UNIVERSIDADES = [
        ("PUC-Rio", "PUC-Rio"),
        ("UFRJ", "UFRJ"),
        ("UERJ", "UERJ"),
        ("UFF", "UFF"),
    ]

    universidade = forms.ChoiceField(
        label="Universidade",
        choices=UNIVERSIDADES,
        widget=forms.Select(attrs={"class": "form-control"})
    )

    CURSOS = [
        ("Administracao", "Administração"),
        ("Direito", "Direito"),
        ("Engenharia", "Engenharia"),
        ("Computacao", "Ciência da Computação"),
        ("Economia", "Economia"),
        ("Psicologia", "Psicologia"),
        ("Design", "Design"),
        ("Comunicacao", "Comunicação"),
        ("Relacoes_Internacionais", "Relações Internacionais"),
        ("Outro", "Outro"),
    ]

    curso = forms.ChoiceField(
        label="Curso",
        choices=CURSOS,
        widget=forms.Select(attrs={"class": "form-control"})
    )

    PERIODOS = [
        ("1", "1º período"),
        ("2", "2º período"),
        ("3", "3º período"),
        ("4", "4º período"),
        ("5", "5º período"),
        ("6", "6º período"),
        ("7", "7º período"),
        ("8", "8º período"),
        ("9", "9º período"),
        ("10", "10º período"),
        ("11", "11º período"),
        ("12", "12º período"),
    ]

    periodo_atual = forms.ChoiceField(
        label="Período atual",
        choices=PERIODOS,
        widget=forms.Select(attrs={"class": "form-control"})
    )

    cr = forms.DecimalField(
        label="CR (opcional)",
        required=False,
        min_value=0,
        max_value=10,
        max_digits=3,
        decimal_places=1,
        widget=forms.NumberInput(attrs={
            "placeholder": "Ex.: 8,4",
            "class": "form-control",
            "step": "0.1",
        })
    )

    aparecer_em_buscas = forms.BooleanField(
        label="Quero aparecer em buscas de recrutadores",
        required=False,
        initial=True,
    )

    aceitar_termos = forms.BooleanField(
        label="Aceito os termos de uso e a política de privacidade",
        required=True,
    )