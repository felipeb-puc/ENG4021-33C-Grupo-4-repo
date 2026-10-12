from django.contrib import admin
from .models import Instituicao, Curso, Aluno, Oportunidade, Candidatura

admin.site.register(Instituicao)
admin.site.register(Curso)
admin.site.register(Aluno)
admin.site.register(Oportunidade)
admin.site.register(Candidatura)
