#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LANGUAGES = ['en', 'es', 'pt', 'fr', 'de', 'ja', 'ko', 'zh-hans', 'zh-hant']
ROWS = '''chooseReports|Choose reports|Elegir reportes|Escolher relatórios|Choisir des rapports|Berichte auswählen|レポートを選択|보고서 선택|选择报告|選取報告
chooseHint|Choose which reports this plugin may query to calculate your statistics.|Elige qué reportes podrá consultar este complemento para calcular tus estadísticas.|Escolha quais relatórios este complemento poderá consultar para calcular suas estatísticas.|Choisissez les rapports que cette extension pourra consulter pour calculer vos statistiques.|Wähle die Berichte aus, die diese Erweiterung für deine Statistik abfragen darf.|統計の計算に使用するため、このプラグインが参照できるレポートを選択します。|통계를 계산할 수 있도록 이 플러그인이 조회할 보고서를 선택하세요.|选择此插件可查询以计算统计数据的报告。|選取此外掛模組可查詢以計算統計資料的報告。
loading|Waiting for access and loading reports…|Esperando autorización y cargando reportes…|Aguardando autorização e carregando relatórios…|En attente d’autorisation et chargement des rapports…|Warten auf Freigabe und Laden der Berichte…|アクセス許可を待機し、レポートを読み込んでいます…|권한을 기다리고 보고서를 불러오는 중…|正在等待授权并加载报告…|正在等待授權並載入報告…
accessError|Reports could not be loaded. Choose reports to try again.|No se pudieron cargar los reportes. Elige los reportes para intentarlo de nuevo.|Não foi possível carregar os relatórios. Escolha os relatórios para tentar novamente.|Impossible de charger les rapports. Choisissez des rapports pour réessayer.|Die Berichte konnten nicht geladen werden. Wähle Berichte aus, um es erneut zu versuchen.|レポートを読み込めませんでした。レポートを選択して再試行してください。|보고서를 불러오지 못했습니다. 보고서를 선택하여 다시 시도하세요.|无法加载报告。请选择报告以重试。|無法載入報告。請選取報告以重試。
title|Library Statistics|Estadísticas de la biblioteca|Estatísticas da biblioteca|Statistiques de la bibliothèque|Bibliotheksstatistik|ライブラリの統計|라이브러리 통계|资料库统计|資料庫統計
eyebrow|AudioGrade plugin|Complemento de AudioGrade|Complemento do AudioGrade|Extension AudioGrade|AudioGrade-Erweiterung|AudioGrade プラグイン|AudioGrade 플러그인|AudioGrade 插件|AudioGrade 外掛模組
subtitle|Explore the reports you selected.|Explora los reportes que seleccionaste.|Explore os relatórios selecionados.|Explorez les rapports sélectionnés.|Erkunde die ausgewählten Berichte.|選択したレポートを確認します。|선택한 보고서를 살펴보세요.|浏览您选择的报告。|瀏覽您選取的報告。
summary|Summary|Resumen|Resumo|Résumé|Übersicht|概要|요약|摘要|摘要
reports|Reports|Reportes|Relatórios|Rapports|Berichte|レポート|보고서|报告|報告
tracks|Tracks|Pistas|Faixas|Pistes|Titel|トラック|트랙|音轨|音軌
duration|Known duration|Duración conocida|Duração conhecida|Durée connue|Bekannte Dauer|既知の長さ|확인된 길이|已知时长|已知長度
formats|Formats|Formatos|Formatos|Formats|Formate|形式|형식|格式|格式
sampleRates|Sample rates|Frecuencias de muestreo|Taxas de amostragem|Fréquences d’échantillonnage|Abtastraten|サンプルレート|샘플 레이트|采样率|取樣率
bitDepths|Bit depths|Profundidades de bits|Profundidades de bits|Profondeurs de bits|Bittiefen|ビット深度|비트 심도|位深度|位元深度
unknown|Unavailable|No disponible|Indisponível|Indisponible|Nicht verfügbar|利用不可|사용 불가|不可用|無法使用
empty|No matching tracks|No hay pistas coincidentes|Nenhuma faixa correspondente|Aucune piste correspondante|Keine passenden Titel|一致するトラックはありません|일치하는 트랙이 없습니다|没有匹配的音轨|沒有符合的音軌
measurements|Track measurements|Mediciones por pista|Medições por faixa|Mesures par piste|Messwerte pro Titel|トラックの測定値|트랙별 측정값|音轨测量值|音軌測量值
search|Search tracks|Buscar pistas|Buscar faixas|Rechercher des pistes|Titel suchen|トラックを検索|트랙 검색|搜索音轨|搜尋音軌
track|Track / report|Pista / reporte|Faixa / relatório|Piste / rapport|Titel / Bericht|トラック / レポート|트랙 / 보고서|音轨 / 报告|音軌 / 報告
format|Format|Formato|Formato|Format|Format|形式|형식|格式|格式
note|Counts cover selected reports, including repeated recordings. Missing values appear as —. LUFS values are not averaged.|Los totales incluyen las grabaciones repetidas entre reportes. Los valores no disponibles aparecen como —. No se promedian los LUFS.|Os totais incluem gravações repetidas entre relatórios. Valores indisponíveis aparecem como —. Os valores LUFS não são promediados.|Les totaux incluent les enregistrements répétés entre rapports. Les valeurs manquantes sont indiquées par —. Les LUFS ne sont pas moyennés.|Summen enthalten mehrfach erfasste Aufnahmen. Fehlende Werte erscheinen als —. LUFS-Werte werden nicht gemittelt.|複数のレポートにある録音は重複して数えます。不明な値は — で表示します。LUFS の平均は計算しません。|여러 보고서에 있는 녹음은 중복 집계됩니다. 누락된 값은 —로 표시합니다. LUFS 평균은 계산하지 않습니다.|统计包含报告中重复的录音。缺失值显示为 —。不对 LUFS 求平均。|統計包含報告中重複的錄音。缺少的值顯示為 —。不對 LUFS 取平均。
missingDuration|Tracks without duration|Pistas sin duración|Faixas sem duração|Pistes sans durée|Titel ohne Dauer|長さが不明なトラック|길이가 없는 트랙|缺少时长的音轨|缺少長度的音軌'''
parts = [row.split('|') for row in ROWS.splitlines()]
assert all(len(row) == 10 for row in parts)
translations = {lang: {row[0]: row[index + 1] for row in parts} for index, lang in enumerate(LANGUAGES)}
folder = ROOT / 'plugins/library-statistics'
(folder / 'locales.js').write_text('/* SPDX-License-Identifier: MIT */\nglobalThis.AudioGradePluginLocales = '
    + json.dumps(translations, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
manifest = {
    'id': 'library-statistics', 'version': '1.1.0', 'apiVersion': 2,
    'name': {lang: text['title'] for lang, text in translations.items()},
    'description': {lang: text['subtitle'] for lang, text in translations.items()},
    'author': 'AudioGrade', 'license': 'MIT',
    'sourceURL': 'https://github.com/gpiano/AudioGradePlugins/tree/library-statistics-v1.1.0/plugins/library-statistics',
    'privacyURL': 'https://github.com/gpiano/AudioGradePlugins/blob/main/PRIVACY.md',
    'supportURL': 'https://github.com/gpiano/AudioGradePlugins/issues/new?template=plugin-issue.yml',
    'universalLink': 'https://audiograde.app/plugins/library-statistics',
    'minimumAge': 4, 'permissions': ['reports.read'], 'entrypoint': 'index.html'
}
(folder / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('External plugin localized in nine languages.')
