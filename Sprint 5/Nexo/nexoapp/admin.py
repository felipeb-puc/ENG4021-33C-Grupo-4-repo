from django.contrib import admin
from .models import (
    Instituicao,
    Curso,
    Aluno,
    Recrutador,
    Representante,
    Oportunidade,
    Candidatura,
    Favorito,
)


class OportunidadeAdmin(admin.ModelAdmin):
    list_display = ("titulo", "tipo", "instituicao", "modalidade", "remuneracao", "prazo_inscricao")
    search_fields = ("titulo", "descricao", "instituicao__nome")
    list_filter = ("tipo", "modalidade", "instituicao")


class CandidaturaAdmin(admin.ModelAdmin):
    list_display = ("aluno", "oportunidade", "status", "data")
    search_fields = ("aluno__matricula", "aluno__user__first_name", "aluno__user__email", "oportunidade__titulo")
    list_filter = ("oportunidade__tipo", "data")


class AlunoAdmin(admin.ModelAdmin):
    list_display = ("matricula", "user", "instituicao", "curso", "periodo", "cr")
    search_fields = ("matricula", "user__first_name", "user__last_name", "user__email")
    list_filter = ("instituicao", "curso", "periodo")


class InstituicaoAdmin(admin.ModelAdmin):
    list_display = ("nome", "tipo", "sede")
    search_fields = ("nome", "sede")
    list_filter = ("tipo",)


admin.site.register(Instituicao, InstituicaoAdmin)
admin.site.register(Candidatura, CandidaturaAdmin)
admin.site.register(Aluno, AlunoAdmin)
admin.site.register(Recrutador)
admin.site.register(Representante)
admin.site.register(Curso)
admin.site.register(Oportunidade, OportunidadeAdmin)
admin.site.register(Favorito)
